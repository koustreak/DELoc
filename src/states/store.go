package states

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	bolt "go.etcd.io/bbolt"
)

const (
	ServicesBucket = "services"
	SettingsBucket = "settings"
	PluginsBucket  = "plugins"
	DBFileName     = "state.db"
)

// AppSettings represents global application-level storage and directory preferences.
type AppSettings struct {
	ArchivePath    string `json:"archivePath"`
	RootVolumePath string `json:"rootVolumePath"`
}

// PythonPackage represents an installed Python package.
type PythonPackage struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	IsCore  bool   `json:"isCore"`
}

// PythonState represents the configured Python runtime state.
type PythonState struct {
	Configured     bool            `json:"configured"`
	ConfigType     string          `json:"configType,omitempty"` // "auto" or "manual"
	Version        string          `json:"version"`
	Type           string          `json:"type"`       // "Virtualenv", "System", "Conda", "Custom"
	TypeLabel      string          `json:"typeLabel"`
	EnvName        string          `json:"envName"`
	ExecutablePath string          `json:"executablePath"`
	EnvPrefix      string          `json:"envPrefix"`
	ConfiguredAt   int64           `json:"configuredAt,omitempty"`
	Packages       []PythonPackage `json:"packages,omitempty"`
}

// ScalaState represents the configured Scala runtime state.
type ScalaState struct {
	Configured     bool   `json:"configured"`
	ConfigType     string `json:"configType,omitempty"` // "auto" or "manual"
	Version        string `json:"version"`
	SbtVersion     string `json:"sbtVersion,omitempty"`
	InstallDir     string `json:"installDir"`
	ExecutablePath string `json:"executablePath"`
	SbtPath        string `json:"sbtPath,omitempty"`
	TargetSpark    string `json:"targetSpark,omitempty"`
	ConfiguredAt   int64  `json:"configuredAt,omitempty"`
}

// ServiceState represents the persisted configuration and runtime state of a service.
type ServiceState struct {
	Configured   bool           `json:"configured"`
	ConfigType   string         `json:"configType,omitempty"` // "auto" or "manual"
	ContainerID  string         `json:"containerId,omitempty"`
	Status       string         `json:"status"` // "unconfigured", "stopped", "running"
	Port         int            `json:"port"`
	Database     string         `json:"database"`
	User         string         `json:"user"`
	DataDir      string         `json:"dataDir"`
	ConfiguredAt int64          `json:"configuredAt,omitempty"`
	StartedAt    int64          `json:"startedAt,omitempty"`
	Config       map[string]any `json:"config,omitempty"`
}

// Store handles persistent disk storage using bbolt.
type Store struct {
	db *bolt.DB
	mu sync.RWMutex
}

// NewStore initializes the bbolt database located inside ~/.deloc/state.db.
func NewStore() (*Store, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get user home directory: %w", err)
	}

	appDir := filepath.Join(homeDir, ".deloc")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create app data directory: %w", err)
	}

	dbPath := filepath.Join(appDir, DBFileName)
	db, err := bolt.Open(dbPath, 0600, &bolt.Options{Timeout: 2 * time.Second})
	if err != nil {
		return nil, fmt.Errorf("failed to open bbolt database at %s: %w", dbPath, err)
	}

	// Ensure required buckets exist
	err = db.Update(func(tx *bolt.Tx) error {
		if _, err := tx.CreateBucketIfNotExists([]byte(ServicesBucket)); err != nil {
			return err
		}
		if _, err := tx.CreateBucketIfNotExists([]byte(SettingsBucket)); err != nil {
			return err
		}
		_, err := tx.CreateBucketIfNotExists([]byte(PluginsBucket))
		return err
	})
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize buckets: %w", err)
	}

	return &Store{db: db}, nil
}

// Close gracefully closes the bbolt database.
func (s *Store) Close() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

// IsServiceConfigured checks whether a specific service has an entry in bbolt and is marked configured.
func (s *Store) IsServiceConfigured(serviceName string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var configured bool
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(ServicesBucket))
		if b == nil {
			return nil
		}
		data := b.Get([]byte(serviceName))
		if data == nil {
			configured = false
			return nil
		}

		var state ServiceState
		if err := json.Unmarshal(data, &state); err != nil {
			return err
		}
		configured = state.Configured
		return nil
	})

	return configured, err
}

// GetServiceState returns the current ServiceState for a service from bbolt.
func (s *Store) GetServiceState(serviceName string) (*ServiceState, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var state *ServiceState
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(ServicesBucket))
		if b == nil {
			return nil
		}
		data := b.Get([]byte(serviceName))
		if data == nil {
			return nil
		}

		var s ServiceState
		if err := json.Unmarshal(data, &s); err != nil {
			return err
		}
		state = &s
		return nil
	})

	return state, err
}

// SaveServiceState writes or updates the ServiceState in bbolt.
func (s *Store) SaveServiceState(serviceName string, state *ServiceState) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.Marshal(state)
	if err != nil {
		return fmt.Errorf("failed to marshal service state: %w", err)
	}

	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(ServicesBucket))
		if b == nil {
			return fmt.Errorf("bucket %s does not exist", ServicesBucket)
		}
		return b.Put([]byte(serviceName), data)
	})
}

// GetAppSettings returns the stored global application settings, falling back to ~/.deloc defaults.
func (s *Store) GetAppSettings() (*AppSettings, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	settings := &AppSettings{
		ArchivePath:    "~/.deloc/archives",
		RootVolumePath: "~/.deloc/data",
	}

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(SettingsBucket))
		if b == nil {
			return nil
		}
		data := b.Get([]byte("app_settings"))
		if data == nil {
			return nil
		}
		return json.Unmarshal(data, settings)
	})
	return settings, err
}

// SaveAppSettings persists global application settings to bbolt.
func (s *Store) SaveAppSettings(settings *AppSettings) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.Marshal(settings)
	if err != nil {
		return err
	}

	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := tx.CreateBucketIfNotExists([]byte(SettingsBucket))
		if err != nil {
			return err
		}
		return b.Put([]byte("app_settings"), data)
	})
}

// GetPythonState retrieves the configured Python runtime state from bbolt.
func (s *Store) GetPythonState() (*PythonState, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var state PythonState
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(PluginsBucket))
		if b == nil {
			return nil
		}
		data := b.Get([]byte("python"))
		if data == nil {
			return nil
		}
		return json.Unmarshal(data, &state)
	})
	if err != nil {
		return nil, err
	}
	return &state, nil
}

// SavePythonState persists the Python runtime state to bbolt.
func (s *Store) SavePythonState(state *PythonState) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.Marshal(state)
	if err != nil {
		return err
	}

	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := tx.CreateBucketIfNotExists([]byte(PluginsBucket))
		if err != nil {
			return err
		}
		return b.Put([]byte("python"), data)
	})
}

// DeletePythonState removes the Python runtime state from bbolt.
func (s *Store) DeletePythonState() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(PluginsBucket))
		if b == nil {
			return nil
		}
		return b.Delete([]byte("python"))
	})
}

// GetScalaState retrieves the configured Scala runtime state from bbolt.
func (s *Store) GetScalaState() (*ScalaState, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var state ScalaState
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(PluginsBucket))
		if b == nil {
			return nil
		}
		data := b.Get([]byte("scala"))
		if data == nil {
			return nil
		}
		return json.Unmarshal(data, &state)
	})
	if err != nil {
		return nil, err
	}
	return &state, nil
}

// SaveScalaState persists the Scala runtime state to bbolt.
func (s *Store) SaveScalaState(state *ScalaState) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.Marshal(state)
	if err != nil {
		return err
	}

	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := tx.CreateBucketIfNotExists([]byte(PluginsBucket))
		if err != nil {
			return err
		}
		return b.Put([]byte("scala"), data)
	})
}

// DeleteScalaState removes the Scala runtime state from bbolt.
func (s *Store) DeleteScalaState() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(PluginsBucket))
		if b == nil {
			return nil
		}
		return b.Delete([]byte("scala"))
	})
}
