package bindings

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"deloc/src/states"
)

// DiscoveredPython represents a detected Python installation on the host system.
type DiscoveredPython struct {
	Path    string `json:"path"`
	Version string `json:"version"`
	Type    string `json:"type"` // "System", "Conda", "Custom"
}

// pipPackageJSON maps output from `pip list --format=json`.
type pipPackageJSON struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

// GetPythonState retrieves the current persisted Python runtime state from bbolt.
func (s *Service) GetPythonState() (*states.PythonState, error) {
	if s.store == nil {
		return &states.PythonState{Configured: false}, nil
	}

	state, err := s.store.GetPythonState()
	if err != nil || state == nil || !state.Configured {
		return &states.PythonState{Configured: false}, nil
	}

	// Verify that the executable still genuinely exists on disk
	if _, err := os.Stat(state.ExecutablePath); err != nil {
		state.Configured = false
		_ = s.store.SavePythonState(state)
	}

	return state, nil
}

// ScanHostPython discovers system Python 3 installations, conda envs, and virtualenvs.
func (s *Service) ScanHostPython() ([]DiscoveredPython, error) {
	candidates := []string{
		"/usr/bin/python3",
		"/usr/local/bin/python3",
		"/usr/bin/python3.12",
		"/usr/bin/python3.11",
		"/usr/bin/python3.10",
		"/usr/bin/python3.9",
		"/usr/bin/python3.8",
		"/usr/bin/python",
	}

	// Discover through `which -a python3`
	if out, err := exec.Command("which", "-a", "python3").Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" {
				candidates = append(candidates, trimmed)
			}
		}
	}

	// Discover common Conda paths
	if home, err := os.UserHomeDir(); err == nil {
		candidates = append(candidates,
			filepath.Join(home, "miniconda3", "bin", "python"),
			filepath.Join(home, "anaconda3", "bin", "python"),
			filepath.Join(home, ".conda", "bin", "python"),
		)
	}

	seen := make(map[string]bool)
	var discovered []DiscoveredPython

	for _, p := range candidates {
		clean := filepath.Clean(p)
		if seen[clean] {
			continue
		}
		seen[clean] = true

		if fi, err := os.Stat(clean); err != nil || fi.IsDir() {
			continue
		}

		out, err := exec.Command(clean, "--version").CombinedOutput()
		if err != nil {
			continue
		}

		ver := strings.TrimSpace(string(out))
		envType := "System"
		if strings.Contains(clean, "conda") {
			envType = "Conda"
		} else if strings.Contains(clean, ".deloc") || strings.Contains(clean, "venv") {
			envType = "Virtualenv"
		}

		discovered = append(discovered, DiscoveredPython{
			Path:    clean,
			Version: ver,
			Type:    envType,
		})
	}

	return discovered, nil
}

// queryPipPackages runs `<python> -m pip list --format=json` and returns the list of packages.
func queryPipPackages(pythonPath string) []states.PythonPackage {
	var pkgs []states.PythonPackage
	out, err := exec.Command(pythonPath, "-m", "pip", "list", "--format=json").Output()
	if err != nil {
		return pkgs
	}

	var raw []pipPackageJSON
	if err := json.Unmarshal(out, &raw); err != nil {
		return pkgs
	}

	corePackages := map[string]bool{
		"pip": true, "setuptools": true, "wheel": true,
	}

	for _, item := range raw {
		nameLow := strings.ToLower(item.Name)
		pkgs = append(pkgs, states.PythonPackage{
			Name:    item.Name,
			Version: item.Version,
			IsCore:  corePackages[nameLow],
		})
	}

	return pkgs
}

// AutoConfigurePython creates an isolated virtual environment under <RootVolumePath>/python/deloc-env,
// bootstraps pip/setuptools, installs foundational packages, and saves state to bbolt.
func (s *Service) AutoConfigurePython() (*states.PythonState, error) {
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
	pythonDir := filepath.Join(resolvedRoot, "python")
	venvDir := filepath.Join(pythonDir, "deloc-env")

	if err := os.MkdirAll(pythonDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create python directory under root volume: %w", err)
	}

	// 2. Locate host Python binary to bootstrap venv
	hostPython := "python3"
	if p, err := exec.LookPath("python3"); err == nil {
		hostPython = p
	} else if p, err := exec.LookPath("/usr/bin/python3"); err == nil {
		hostPython = p
	}

	// 3. Create virtual environment
	pyBin := filepath.Join(venvDir, "bin", "python")
	if _, err := os.Stat(pyBin); err != nil {
		cmd := exec.Command(hostPython, "-m", "venv", venvDir)
		if out, err := cmd.CombinedOutput(); err != nil {
			return nil, fmt.Errorf("failed creating virtualenv at %s: %s (%w)", venvDir, strings.TrimSpace(string(out)), err)
		}
	}

	// 4. Upgrade pip and setuptools
	_ = exec.Command(pyBin, "-m", "pip", "install", "--upgrade", "pip", "setuptools").Run()

	// 5. Install essential data engineering libraries (duckdb, psycopg2-binary, pyarrow, pandas)
	_ = exec.Command(pyBin, "-m", "pip", "install", "duckdb", "psycopg2-binary", "pyarrow", "pandas").Run()

	// 6. Query version and installed packages
	verOut, _ := exec.Command(pyBin, "--version").Output()
	versionStr := strings.TrimSpace(string(verOut))
	if versionStr == "" {
		versionStr = "Python 3"
	}

	pkgs := queryPipPackages(pyBin)

	state := &states.PythonState{
		Configured:     true,
		ConfigType:     "auto",
		Version:        versionStr,
		Type:           "Virtualenv",
		TypeLabel:      "venv (deloc-env)",
		EnvName:        "deloc-env",
		ExecutablePath: pyBin,
		EnvPrefix:      venvDir,
		ConfiguredAt:   time.Now().Unix(),
		Packages:       pkgs,
	}

	if err := s.store.SavePythonState(state); err != nil {
		return nil, fmt.Errorf("failed to save python state in store: %w", err)
	}

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:python:updated", state)
	}

	return state, nil
}

// ConfigureManualPython binds an existing or custom Python interpreter and saves state to bbolt.
func (s *Service) ConfigureManualPython(executablePath string, envType string, envName string) (*states.PythonState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	cleanPath := strings.TrimSpace(executablePath)
	if cleanPath == "" {
		return nil, fmt.Errorf("executable path cannot be empty")
	}
	cleanPath = expandHomePath(cleanPath)

	if _, err := os.Stat(cleanPath); err != nil {
		return nil, fmt.Errorf("executable '%s' does not exist", cleanPath)
	}

	verOut, err := exec.Command(cleanPath, "--version").CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("failed running '%s --version': %s", cleanPath, strings.TrimSpace(string(verOut)))
	}

	versionStr := strings.TrimSpace(string(verOut))
	if envType == "" {
		envType = "Custom"
	}
	if envName == "" {
		envName = filepath.Base(filepath.Dir(cleanPath))
	}

	prefix := filepath.Dir(filepath.Dir(cleanPath))
	pkgs := queryPipPackages(cleanPath)

	state := &states.PythonState{
		Configured:     true,
		ConfigType:     "manual",
		Version:        versionStr,
		Type:           envType,
		TypeLabel:      fmt.Sprintf("%s (%s)", strings.ToLower(envType), envName),
		EnvName:        envName,
		ExecutablePath: cleanPath,
		EnvPrefix:      prefix,
		ConfiguredAt:   time.Now().Unix(),
		Packages:       pkgs,
	}

	if err := s.store.SavePythonState(state); err != nil {
		return nil, fmt.Errorf("failed to save python state in store: %w", err)
	}

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:python:updated", state)
	}

	return state, nil
}

// DisablePython unbinds the Python environment, optionally deletes the virtualenv files,
// and resets the state in bbolt to unconfigured.
func (s *Service) DisablePython(deleteFiles bool) (*states.PythonState, error) {
	if s.store == nil {
		return nil, fmt.Errorf("persistent store not initialized")
	}

	state, _ := s.store.GetPythonState()
	if state != nil && deleteFiles && state.EnvPrefix != "" {
		// Safety check: only delete if the prefix is inside a python or deloc directory
		norm := filepath.ToSlash(state.EnvPrefix)
		if strings.Contains(norm, "/python/") || strings.Contains(norm, "/.deloc/") {
			_ = os.RemoveAll(state.EnvPrefix)
		}
	}

	_ = s.store.DeletePythonState()

	resetState := &states.PythonState{
		Configured: false,
	}

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:python:updated", resetState)
	}

	return resetState, nil
}

// InstallPythonPackage installs a new PyPI package into the configured Python environment.
func (s *Service) InstallPythonPackage(packageName string) ([]states.PythonPackage, error) {
	cleanName := strings.TrimSpace(packageName)
	if cleanName == "" {
		return nil, fmt.Errorf("package name cannot be empty")
	}

	state, err := s.GetPythonState()
	if err != nil || state == nil || !state.Configured {
		return nil, fmt.Errorf("no active Python environment configured")
	}

	cmd := exec.Command(state.ExecutablePath, "-m", "pip", "install", cleanName)
	if out, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("pip install %s failed: %s", cleanName, strings.TrimSpace(string(out)))
	}

	pkgs := queryPipPackages(state.ExecutablePath)
	state.Packages = pkgs
	_ = s.store.SavePythonState(state)

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:python:updated", state)
	}

	return pkgs, nil
}

// UninstallPythonPackage removes an installed package from the active Python environment.
func (s *Service) UninstallPythonPackage(packageName string) ([]states.PythonPackage, error) {
	cleanName := strings.TrimSpace(packageName)
	if cleanName == "" {
		return nil, fmt.Errorf("package name cannot be empty")
	}

	state, err := s.GetPythonState()
	if err != nil || state == nil || !state.Configured {
		return nil, fmt.Errorf("no active Python environment configured")
	}

	cmd := exec.Command(state.ExecutablePath, "-m", "pip", "uninstall", "-y", cleanName)
	if out, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("pip uninstall %s failed: %s", cleanName, strings.TrimSpace(string(out)))
	}

	pkgs := queryPipPackages(state.ExecutablePath)
	state.Packages = pkgs
	_ = s.store.SavePythonState(state)

	if s.ctx != nil {
		wailsRuntime.EventsEmit(s.ctx, "plugins:python:updated", state)
	}

	return pkgs, nil
}
