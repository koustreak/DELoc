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
	DBFileName     = "state.db"
)

// ServiceState represents the persisted configuration and runtime state of a service.
type ServiceState struct {
	Configured   bool              `json:"configured"`
	ContainerID  string            `json:"containerId,omitempty"`
	Status       string            `json:"status"` // "unconfigured", "stopped", "running"
	Port         int               `json:"port"`
	Database     string            `json:"database"`
	User         string            `json:"user"`
	DataDir      string            `json:"dataDir"`
	ConfiguredAt int64             `json:"configuredAt,omitempty"`
	StartedAt    int64             `json:"startedAt,omitempty"`
	Config       map[string]any    `json:"config,omitempty"`
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
		_, err := tx.CreateBucketIfNotExists([]byte(ServicesBucket))
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

