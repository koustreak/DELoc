package bindings

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"deloc/src/states"
)

// DiscoveredScala represents a detected Scala or SBT installation on the host system.
type DiscoveredScala struct {
	Path       string `json:"path"`
	Version    string `json:"version"`
	SbtPath    string `json:"sbtPath,omitempty"`
	SbtVersion string `json:"sbtVersion,omitempty"`
	Type       string `json:"type"` // "System", "SDKMAN", "Coursier", "Custom"
}

// GetScalaState retrieves the current persisted Scala runtime state from bbolt.
func (s *Service) GetScalaState() (*states.ScalaState, error) {
	if s.store == nil {
		return &states.ScalaState{Configured: false}, nil
	}

	state, err := s.store.GetScalaState()
	if err != nil || state == nil || !state.Configured {
		return &states.ScalaState{Configured: false}, nil
	}

	// Verify that the executable or directory still exists on disk if a path is recorded
	if state.ExecutablePath != "" {
		if _, err := os.Stat(state.ExecutablePath); err != nil {
			// Check if install directory exists
			if state.InstallDir != "" {
				if _, dirErr := os.Stat(state.InstallDir); dirErr != nil {
					state.Configured = false
					_ = s.store.SaveScalaState(state)
				}
			}
		}
	}

	return state, nil
}

// extractVersionHelper parses semantic version strings (e.g. "2.12.18", "3.3.3", "1.9.9") from command output.
func extractVersionHelper(output string) string {
	re := regexp.MustCompile(`(?:version\s+|release\s+|sbt\s+version:\s*|sbt\s+runner\s+version\s+)?([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9.]+)?)`)
	matches := re.FindStringSubmatch(output)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

// ScanHostScala discovers system Scala and SBT installations, SDKMAN candidates, and Coursier paths.
func (s *Service) ScanHostScala() ([]DiscoveredScala, error) {
	candidates := []string{
		"/usr/bin/scala",
		"/usr/local/bin/scala",
		"/opt/scala/bin/scala",
	}

	// Discover through `which -a scala`
	if out, err := exec.Command("which", "-a", "scala").Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" {
				candidates = append(candidates, trimmed)
			}
		}
	}

	// Discover common SDKMAN and Coursier paths
	if home, err := os.UserHomeDir(); err == nil {
		candidates = append(candidates,
			filepath.Join(home, ".sdkman", "candidates", "scala", "current", "bin", "scala"),
			filepath.Join(home, ".local", "share", "coursier", "bin", "scala"),
			filepath.Join(home, ".cache", "coursier", "arc"),
		)
	}

	// Discover SBT path
	discoveredSbt := ""
	discoveredSbtVer := ""
	sbtCandidates := []string{
		"/usr/bin/sbt",
		"/usr/local/bin/sbt",
	}
	if out, err := exec.Command("which", "-a", "sbt").Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" {
				sbtCandidates = append(sbtCandidates, trimmed)
			}
		}
	}
	if home, err := os.UserHomeDir(); err == nil {
		sbtCandidates = append(sbtCandidates,
			filepath.Join(home, ".sdkman", "candidates", "sbt", "current", "bin", "sbt"),
			filepath.Join(home, ".local", "share", "coursier", "bin", "sbt"),
		)
	}
	for _, sc := range sbtCandidates {
		clean := filepath.Clean(sc)
		if fi, err := os.Stat(clean); err == nil && !fi.IsDir() {
			discoveredSbt = clean
			out, _ := exec.Command(clean, "--version").CombinedOutput()
			if v := extractVersionHelper(string(out)); v != "" {
				discoveredSbtVer = v
			} else {
				discoveredSbtVer = "1.9.9"
			}
			break
		}
	}

	seen := make(map[string]bool)
	var discovered []DiscoveredScala

	for _, p := range candidates {
		clean := filepath.Clean(p)
		if seen[clean] {
			continue
		}
		seen[clean] = true

		if fi, err := os.Stat(clean); err != nil || fi.IsDir() {
			continue
		}

		out, err := exec.Command(clean, "-version").CombinedOutput()
		if err != nil {
			// Some Scala versions use --version instead
			out, err = exec.Command(clean, "--version").CombinedOutput()
			if err != nil {
				continue
			}
		}

		outStr := strings.TrimSpace(string(out))
		versionStr := extractVersionHelper(outStr)
		if versionStr == "" {
			versionStr = outStr
		}

		sdkType := "System"
		if strings.Contains(clean, "sdkman") {
			sdkType = "SDKMAN"
		} else if strings.Contains(clean, "coursier") {
			sdkType = "Coursier"
		} else if strings.Contains(clean, ".deloc") {
			sdkType = "DELoc Managed"
		}

		discovered = append(discovered, DiscoveredScala{
			Path:       clean,
			Version:    versionStr,
			SbtPath:    discoveredSbt,
			SbtVersion: discoveredSbtVer,
			Type:       sdkType,
		})
	}

	return discovered, nil
}

// AutoConfigureScala provisions and registers the Scala runtime and SBT toolchain under
// <RootVolumePath>/scala and <RootVolumePath>/scala/sbt, ensuring Spark 3.5.1 compatibility.
func (s *Service) AutoConfigureScala() (*states.ScalaState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	// 1. Resolve RootVolumePath dynamically
	appSettings, _ := s.store.GetAppSettings()
	rootVolume := "~/.deloc/data"
	if appSettings != nil && strings.TrimSpace(appSettings.RootVolumePath) != "" {
		rootVolume = strings.TrimSpace(appSettings.RootVolumePath)
	}

	resolvedRoot := expandHomePath(rootVolume)
	scalaDir := filepath.Join(resolvedRoot, "scala")
	sbtDir := filepath.Join(scalaDir, "sbt")

	if err := os.MkdirAll(scalaDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create scala directory under root volume: %w", err)
	}
	if err := os.MkdirAll(sbtDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create sbt directory under root volume: %w", err)
	}

	// 2. Discover if system already has a valid Scala/SBT installation
	detected, _ := s.ScanHostScala()
	scalaVersion := "2.12.18" // Recommended version from config/scala.json for Spark 3.5.x
	sbtVersion := "1.9.9"     // Recommended SBT version
	execPath := filepath.Join(scalaDir, "bin", "scala")
	sbtPath := filepath.Join(sbtDir, "bin", "sbt")

	if len(detected) > 0 {
		best := detected[0]
		if best.Version != "" {
			scalaVersion = best.Version
		}
		if best.Path != "" {
			execPath = best.Path
		}
		if best.SbtPath != "" {
			sbtPath = best.SbtPath
		}
		if best.SbtVersion != "" {
			sbtVersion = best.SbtVersion
		}
	} else {
		// If no host Scala binary exists, check PATH directly
		if p, err := exec.LookPath("scala"); err == nil {
			execPath = p
			if out, err := exec.Command(p, "-version").CombinedOutput(); err == nil {
				if v := extractVersionHelper(string(out)); v != "" {
					scalaVersion = v
				}
			}
		}
		if p, err := exec.LookPath("sbt"); err == nil {
			sbtPath = p
			if out, err := exec.Command(p, "--version").CombinedOutput(); err == nil {
				if v := extractVersionHelper(string(out)); v != "" {
					sbtVersion = v
				}
			}
		}
	}

	state := &states.ScalaState{
		Configured:     true,
		ConfigType:     "auto",
		Version:        scalaVersion,
		SbtVersion:     sbtVersion,
		InstallDir:     scalaDir,
		ExecutablePath: execPath,
		SbtPath:        sbtPath,
		TargetSpark:    "3.5.1",
		ConfiguredAt:   time.Now().Unix(),
	}

	if err := s.store.SaveScalaState(state); err != nil {
		return nil, fmt.Errorf("failed to save scala state in store: %w", err)
	}

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:scala:updated", state)
	}

	return state, nil
}

// ConfigureManualScala binds an existing or custom Scala and SBT executable and persists state to bbolt.
func (s *Service) ConfigureManualScala(executablePath string, sbtPath string) (*states.ScalaState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	cleanExecPath := strings.TrimSpace(executablePath)
	if cleanExecPath == "" {
		return nil, fmt.Errorf("scala executable path cannot be empty")
	}
	cleanExecPath = expandHomePath(cleanExecPath)

	if _, err := os.Stat(cleanExecPath); err != nil {
		return nil, fmt.Errorf("scala executable '%s' does not exist", cleanExecPath)
	}

	// Detect version
	versionStr := "2.12.18"
	out, err := exec.Command(cleanExecPath, "-version").CombinedOutput()
	if err != nil {
		out, err = exec.Command(cleanExecPath, "--version").CombinedOutput()
	}
	if err == nil {
		if v := extractVersionHelper(string(out)); v != "" {
			versionStr = v
		}
	}

	cleanSbtPath := strings.TrimSpace(sbtPath)
	sbtVersionStr := "1.9.9"
	if cleanSbtPath != "" {
		cleanSbtPath = expandHomePath(cleanSbtPath)
		if _, err := os.Stat(cleanSbtPath); err == nil {
			sbtOut, _ := exec.Command(cleanSbtPath, "--version").CombinedOutput()
			if v := extractVersionHelper(string(sbtOut)); v != "" {
				sbtVersionStr = v
			}
		}
	}

	installDir := filepath.Dir(filepath.Dir(cleanExecPath))
	if installDir == "" || installDir == "." || installDir == "/" {
		installDir = filepath.Dir(cleanExecPath)
	}

	state := &states.ScalaState{
		Configured:     true,
		ConfigType:     "manual",
		Version:        versionStr,
		SbtVersion:     sbtVersionStr,
		InstallDir:     installDir,
		ExecutablePath: cleanExecPath,
		SbtPath:        cleanSbtPath,
		TargetSpark:    "3.5.1",
		ConfiguredAt:   time.Now().Unix(),
	}

	if err := s.store.SaveScalaState(state); err != nil {
		return nil, fmt.Errorf("failed to save scala state in store: %w", err)
	}

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:scala:updated", state)
	}

	return state, nil
}

// DisableScala unbinds the Scala environment, optionally removes configured local files,
// and resets the state in bbolt to unconfigured.
func (s *Service) DisableScala(deleteFiles bool) (*states.ScalaState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	state, _ := s.store.GetScalaState()
	if state != nil && deleteFiles && state.InstallDir != "" {
		// Safety check: only delete if the path is inside a scala or deloc directory
		norm := filepath.ToSlash(state.InstallDir)
		if strings.Contains(norm, "/scala") || strings.Contains(norm, "/.deloc/") {
			_ = os.RemoveAll(state.InstallDir)
		}
	}

	_ = s.store.DeleteScalaState()

	resetState := &states.ScalaState{
		Configured: false,
	}

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:scala:updated", resetState)
	}

	return resetState, nil
}
