package bindings

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// Service exposes backend APIs to the Wails frontend runtime.
type Service struct {
	ctx    context.Context
	cache  map[string][]string
	mu     sync.RWMutex
	client *http.Client
}

// NewService creates a new bindings service instance.
func NewService() *Service {
	return &Service{
		cache: make(map[string][]string),
		client: &http.Client{
			Timeout: 8 * time.Second,
		},
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
