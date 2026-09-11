package bindings

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
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
