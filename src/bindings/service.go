package bindings

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strings"
	"sync"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"deloc/src/states"
)

// Service exposes backend APIs to the Wails frontend runtime.
type Service struct {
	ctx    context.Context
	cache  map[string][]string
	mu     sync.RWMutex
	client *http.Client
	store  *states.Store
}

// NewService creates a new bindings service instance with persistent store.
func NewService(store *states.Store) *Service {
	return &Service{
		cache: make(map[string][]string),
		client: &http.Client{
			Timeout: 8 * time.Second,
		},
		store: store,
	}
}

// Startup is called when the app starts.
func (s *Service) Startup(ctx context.Context) {
	s.ctx = ctx
}

type dockerHubTagItem struct {
	Name string `json:"name"`
}

type dockerHubTagsResponse struct {
	Count   int                `json:"count"`
	Results []dockerHubTagItem `json:"results"`
	Message string             `json:"message"`
}

// FetchDockerTags queries the Docker Hub API for up to 30 recent tags of a given repository.
// Supports both official library images ("postgres", "redis") and org/repo ("apache/kafka", "bitnami/spark").
// Results are cached in-memory per session to respect Docker Hub rate limits.
func (s *Service) FetchDockerTags(rawRepo string) ([]string, error) {
	clean := strings.TrimSpace(rawRepo)
	if clean == "" {
		return nil, fmt.Errorf("repository name cannot be empty")
	}

	// Strip tag or digest if provided (e.g. "apache/kafka:latest" -> "apache/kafka")
	if idx := strings.Index(clean, "@"); idx != -1 {
		clean = clean[:idx]
	}
	if idx := strings.Index(clean, ":"); idx != -1 {
		clean = clean[:idx]
	}
	// Strip optional docker.io registry prefix
	clean = strings.TrimPrefix(clean, "docker.io/")

	// Check cache
	s.mu.RLock()
	if cached, ok := s.cache[clean]; ok {
		s.mu.RUnlock()
		return cached, nil
	}
	s.mu.RUnlock()

	// Normalize namespace / repository
	var namespace, repository string
	parts := strings.SplitN(clean, "/", 2)
	if len(parts) == 1 {
		namespace = "library"
		repository = parts[0]
	} else {
		namespace = parts[0]
		repository = parts[1]
	}

	apiURL := fmt.Sprintf("https://hub.docker.com/v2/repositories/%s/%s/tags?page_size=30&ordering=last_updated", namespace, repository)

	req, err := http.NewRequestWithContext(s.ctx, http.MethodGet, apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("User-Agent", "DELoc-Client/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("docker hub request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("repository '%s/%s' not found on Docker Hub", namespace, repository)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("docker hub returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024)) // 1MB max safety limit
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var data dockerHubTagsResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse tags response: %w", err)
	}

	tags := make([]string, 0, len(data.Results))
	for _, item := range data.Results {
		trimmedTag := strings.TrimSpace(item.Name)
		if trimmedTag != "" {
			tags = append(tags, trimmedTag)
		}
	}

	// Cache successful responses
	s.mu.Lock()
	s.cache[clean] = tags
	s.mu.Unlock()

	return tags, nil
}

// OpenTerminal launches an external terminal emulator on the host desktop connected to the container via docker exec.
// It auto-detects installed terminal emulators (gnome-terminal, x-terminal-emulator, kgx, ptyxis, konsole, xfce4-terminal, alacritty, kitty, xterm).
func (s *Service) OpenTerminal(containerName string) error {
	clean := strings.TrimSpace(containerName)
	if clean == "" {
		return fmt.Errorf("container name cannot be empty")
	}

	// Verify docker CLI is installed
	if _, err := exec.LookPath("docker"); err != nil {
		return fmt.Errorf("docker command not found on host system: %w", err)
	}

	// Shell command to run: try bash first, fallback to sh. If it exits with error, pause so user sees why.
	dockerCmd := fmt.Sprintf("docker exec -it %s sh -c 'command -v bash >/dev/null 2>&1 && exec bash || exec sh' || (echo ''; echo 'Process exited. Press Enter to close...'; read _)", clean)

	type termConfig struct {
		bin  string
		args []string
	}

	candidates := []termConfig{
		{bin: "gnome-terminal", args: []string{"--", "bash", "-c", dockerCmd}},
		{bin: "x-terminal-emulator", args: []string{"-e", "bash", "-c", dockerCmd}},
		{bin: "kgx", args: []string{"-e", fmt.Sprintf("bash -c %q", dockerCmd)}},
		{bin: "ptyxis", args: []string{"--", "bash", "-c", dockerCmd}},
		{bin: "konsole", args: []string{"-e", "bash", "-c", dockerCmd}},
		{bin: "xfce4-terminal", args: []string{"-e", fmt.Sprintf("bash -c %q", dockerCmd)}},
		{bin: "alacritty", args: []string{"-e", "bash", "-c", dockerCmd}},
		{bin: "kitty", args: []string{"bash", "-c", dockerCmd}},
		{bin: "xterm", args: []string{"-e", "bash", "-c", dockerCmd}},
	}

	for _, cand := range candidates {
		if path, err := exec.LookPath(cand.bin); err == nil && path != "" {
			cmd := exec.Command(cand.bin, cand.args...)
			if err := cmd.Start(); err == nil {
				return nil
			}
		}
	}

	return fmt.Errorf("no supported terminal emulator found (tried gnome-terminal, x-terminal-emulator, kgx, konsole, xterm)")
}

// SelectDirectory opens the native OS folder picker dialog and returns the selected directory path.
func (s *Service) SelectDirectory(title string) (string, error) {
	if s.ctx == nil {
		return "", fmt.Errorf("application context not ready")
	}
	dlgTitle := strings.TrimSpace(title)
	if dlgTitle == "" {
		dlgTitle = "Select Directory"
	}
	return wailsRuntime.OpenDirectoryDialog(s.ctx, wailsRuntime.OpenDialogOptions{
		Title: dlgTitle,
	})
}

// IsServiceConfigured checks if a service is marked configured in bbolt.
func (s *Service) IsServiceConfigured(serviceName string) (bool, error) {
	if s.store == nil {
		return false, fmt.Errorf("persistent store not initialized")
	}
	name := strings.ToLower(strings.TrimSpace(serviceName))
	return s.store.IsServiceConfigured(name)
}

// GetServiceState returns the persisted state of a service from bbolt.
func (s *Service) GetServiceState(serviceName string) (*states.ServiceState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}
	name := strings.ToLower(strings.TrimSpace(serviceName))
	return s.store.GetServiceState(name)
}

// ServiceRuntimeConfig defines the runtime container options for a service.
type ServiceRuntimeConfig struct {
	Type            string `json:"type"`
	Image           string `json:"image"`
	ContainerName   string `json:"container_name"`
	DefaultPort     int    `json:"default_port"`
	DefaultDatabase string `json:"default_database"`
	DefaultUser     string `json:"default_user"`
	DefaultDataDir  string `json:"default_data_dir"`
}

// ServiceJDBCConfig defines the JDBC driver coordinates and configuration.
type ServiceJDBCConfig struct {
	DriverClass              string `json:"driver_class"`
	RecommendedDriverVersion string `json:"recommended_driver_version"`
	MavenCoordinate          string `json:"maven_coordinate"`
}

// ServiceConfigDef maps the schema of config/services.json for a service.
type ServiceConfigDef struct {
	Name        string               `json:"name"`
	Description string               `json:"description"`
	Version     string               `json:"version"`
	Runtime     ServiceRuntimeConfig `json:"runtime"`
	JDBC        ServiceJDBCConfig    `json:"jdbc"`
	Extensions  map[string]any       `json:"extensions"`
}

// loadServiceConfigDef searches and parses config/services.json.
func loadServiceConfigDef(serviceKey string) (*ServiceConfigDef, error) {
	pathsToTry := []string{
		"config/services.json",
		filepath.Join(".", "config", "services.json"),
	}
	if home, err := os.UserHomeDir(); err == nil {
		pathsToTry = append(pathsToTry, filepath.Join(home, ".deloc", "config", "services.json"))
	}

	var data []byte
	var readErr error
	for _, p := range pathsToTry {
		data, readErr = os.ReadFile(p)
		if readErr == nil && len(data) > 0 {
			break
		}
	}

	if len(data) == 0 {
		return nil, fmt.Errorf("could not read config/services.json from any known path: %w", readErr)
	}

	var allConfigs map[string]ServiceConfigDef
	if err := json.Unmarshal(data, &allConfigs); err != nil {
		return nil, fmt.Errorf("failed to parse config/services.json: %w", err)
	}

	key := strings.ToLower(strings.TrimSpace(serviceKey))
	cfg, ok := allConfigs[key]
	if !ok && key == "postgres" {
		cfg, ok = allConfigs["postgresql"]
	}
	if !ok {
		return nil, fmt.Errorf("service '%s' not found in config/services.json", serviceKey)
	}

	// Substitute dynamic placeholders like <username>
	currentUser := "user"
	if u, err := user.Current(); err == nil && u.Username != "" {
		currentUser = u.Username
	}
	cfg.Runtime.ContainerName = strings.ReplaceAll(cfg.Runtime.ContainerName, "<username>", currentUser)

	return &cfg, nil
}

// checkImageExists verifies if a Docker image is locally present in the Docker daemon cache.
func checkImageExists(image string) bool {
	cmd := exec.Command("docker", "image", "inspect", image)
	return cmd.Run() == nil
}

// pullDockerImage pulls the specified Docker image from registry.
func pullDockerImage(ctx context.Context, image string) error {
	var cmd *exec.Cmd
	if ctx != nil {
		cmd = exec.CommandContext(ctx, "docker", "pull", image)
	} else {
		cmd = exec.Command("docker", "pull", image)
	}
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to pull docker image %s: %s (%w)", image, string(out), err)
	}
	return nil
}

// expandHomePath expands '~/' in a directory path to the user's home directory.
func expandHomePath(p string) string {
	if strings.HasPrefix(p, "~/") {
		if home, err := os.UserHomeDir(); err == nil {
			return filepath.Join(home, p[2:])
		}
	}
	return p
}

// AutoConfigureService automatically applies recommended defaults from config/services.json and marks it configured in bbolt without starting the container.
func (s *Service) AutoConfigureService(serviceName string) (*states.ServiceState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	name := strings.ToLower(strings.TrimSpace(serviceName))
	cfg, err := loadServiceConfigDef(name)
	if err != nil {
		return nil, fmt.Errorf("auto-configuration failed: %w", err)
	}

	// 1. Check if the image is available locally; if not, download it
	image := cfg.Runtime.Image
	if image == "" {
		image = "postgres:17-alpine"
	}
	if !checkImageExists(image) {
		if err := pullDockerImage(s.ctx, image); err != nil {
			return nil, fmt.Errorf("failed downloading docker image %s: %w", image, err)
		}
	}

	port := cfg.Runtime.DefaultPort
	if port == 0 {
		port = 5432
	}
	db := cfg.Runtime.DefaultDatabase
	if db == "" {
		db = "deloc_db"
	}
	dbUser := cfg.Runtime.DefaultUser
	if dbUser == "" {
		dbUser = "postgres"
	}
	dataDir := cfg.Runtime.DefaultDataDir
	if dataDir == "" {
		dataDir = "~/.deloc/data/postgres"
	}

	// 2. Insert the record in bbolt, but DO NOT start the container (status: Stopped)
	state := states.ServiceState{
		Configured:   true,
		ConfigType:   "auto",
		ContainerID:  "",
		Status:       "Stopped",
		Port:         port,
		Database:     db,
		User:         dbUser,
		DataDir:      dataDir,
		ConfiguredAt: time.Now().Unix(),
		Config: map[string]any{
			"image":         image,
			"containerName": cfg.Runtime.ContainerName,
			"version":       cfg.Version,
			"extensions":    cfg.Extensions,
			"jdbc":          cfg.JDBC,
		},
	}

	if err := s.store.SaveServiceState(name, &state); err != nil {
		return nil, fmt.Errorf("failed to save state: %w", err)
	}

	return &state, nil
}

// StartService starts the Docker container for a configured service and updates bbolt to Running.
func (s *Service) StartService(serviceName string) (*states.ServiceState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	name := strings.ToLower(strings.TrimSpace(serviceName))
	state, err := s.store.GetServiceState(name)
	if err != nil || state == nil || !state.Configured {
		return nil, fmt.Errorf("service %s is not configured", serviceName)
	}

	containerName := ""
	image := "postgres:17-alpine"
	if state.Config != nil {
		if c, ok := state.Config["containerName"].(string); ok && c != "" {
			containerName = c
		}
		if img, ok := state.Config["image"].(string); ok && img != "" {
			image = img
		}
	}
	if containerName == "" {
		currentUser := "user"
		if u, err := user.Current(); err == nil && u.Username != "" {
			currentUser = u.Username
		}
		containerName = fmt.Sprintf("deloc-%s-%s", name, currentUser)
	}

	// Check if container already exists
	checkCmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=^/%s$", containerName), "--format", "{{.ID}}")
	existingOut, _ := checkCmd.Output()
	existingID := strings.TrimSpace(string(existingOut))

	if existingID != "" {
		// Existing container found: start it
		startCmd := exec.Command("docker", "start", containerName)
		if startOut, err := startCmd.CombinedOutput(); err != nil {
			return nil, fmt.Errorf("failed to start existing container %s: %s (%w)", containerName, string(startOut), err)
		}
		state.ContainerID = existingID
	} else {
		// New container: ensure data directory exists on host
		hostDataDir := expandHomePath(state.DataDir)
		if err := os.MkdirAll(hostDataDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create data directory %s: %w", hostDataDir, err)
		}

		port := state.Port
		if port == 0 {
			port = 5432
		}
		db := state.Database
		if db == "" {
			db = "deloc_db"
		}
		dbUser := state.User
		if dbUser == "" {
			dbUser = "postgres"
		}

		args := []string{
			"run", "-d",
			"--name", containerName,
			"-p", fmt.Sprintf("%d:5432", port),
			"-e", fmt.Sprintf("POSTGRES_DB=%s", db),
			"-e", fmt.Sprintf("POSTGRES_USER=%s", dbUser),
			"-e", "POSTGRES_PASSWORD=postgres",
			"-v", fmt.Sprintf("%s:/var/lib/postgresql/data", hostDataDir),
			image,
		}

		runCmd := exec.Command("docker", args...)
		runOut, err := runCmd.CombinedOutput()
		if err != nil {
			return nil, fmt.Errorf("failed to run container %s: %s (%w)", containerName, string(runOut), err)
		}
		state.ContainerID = strings.TrimSpace(string(runOut))
	}

	state.Status = "Running"
	state.StartedAt = time.Now().Unix()
	if err := s.store.SaveServiceState(name, state); err != nil {
		return nil, fmt.Errorf("failed to update state in bbolt: %w", err)
	}

	return state, nil
}

// StopService stops the running Docker container for a service and updates bbolt to Stopped.
func (s *Service) StopService(serviceName string) (*states.ServiceState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	name := strings.ToLower(strings.TrimSpace(serviceName))
	state, err := s.store.GetServiceState(name)
	if err != nil || state == nil {
		return nil, fmt.Errorf("service %s not found", serviceName)
	}

	containerTarget := state.ContainerID
	if state.Config != nil {
		if c, ok := state.Config["containerName"].(string); ok && c != "" {
			containerTarget = c
		}
	}
	if containerTarget == "" {
		containerTarget = fmt.Sprintf("deloc-%s", name)
	}

	stopCmd := exec.Command("docker", "stop", containerTarget)
	_ = stopCmd.Run()

	state.Status = "Stopped"
	if err := s.store.SaveServiceState(name, state); err != nil {
		return nil, fmt.Errorf("failed to update state in bbolt: %w", err)
	}

	return state, nil
}

// GetServiceDefinition returns the definition from config/services.json for a given service.
func (s *Service) GetServiceDefinition(serviceName string) (*ServiceConfigDef, error) {
	return loadServiceConfigDef(serviceName)
}

// SaveServiceState persists custom service configuration to bbolt.
func (s *Service) SaveServiceState(serviceName string, state states.ServiceState) error {
	if s.store == nil {
		return fmt.Errorf("persistent store not initialized")
	}
	name := strings.ToLower(strings.TrimSpace(serviceName))
	state.Configured = true
	if state.ConfigType == "" {
		state.ConfigType = "manual"
	}
	if state.ConfiguredAt == 0 {
		state.ConfiguredAt = time.Now().Unix()
	}
	return s.store.SaveServiceState(name, &state)
}
