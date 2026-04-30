package system

import (
	"context"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Stats represents the system metrics broadcast to the frontend.
type Stats struct {
	CPUUsage    float64 `json:"cpuUsage"`
	MemoryUsed  float64 `json:"memoryUsed"`
	MemoryTotal float64 `json:"memoryTotal"`
	MemoryPerc  float64 `json:"memoryPerc"`
}

// Manager handles the gathering and broadcasting of system metrics.
// It follows Google-style Go practices by isolating the background monitoring logic.
type Manager struct {
	ctx context.Context
}

// NewManager creates a new instance of the system monitor manager.
func NewManager() *Manager {
	return &Manager{}
}

// Start initiates the monitoring loop. It should be called during Wails onStartup.
func (m *Manager) Start(ctx context.Context) {
	m.ctx = ctx
	// Warm up the CPU collector so the first tick isn't 0
	_, _ = cpu.Percent(0, false)
	// Run the monitoring loop in a separate goroutine to avoid blocking the main app.
	go m.monitorLoop()
}

// monitorLoop fetches system stats at regular intervals and emits them via Wails events.
func (m *Manager) monitorLoop() {
	// We use a shorter tick interval for that "Task Manager" instantaneous feel.
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-m.ctx.Done():
			// Cleanly stop the loop if the application context is cancelled.
			return
		case <-ticker.C:
			stats := m.getSystemStats()
			// Push the stats to the frontend with a specific event ID.
			runtime.EventsEmit(m.ctx, "system:stats", stats)
		}
	}
}

// getSystemStats collects CPU and Memory data using gopsutil.
func (m *Manager) getSystemStats() Stats {
	// cpu.Percent(0, false) returns the instantaneous usage based on the last call.
	// Since we are running in a loop, it will give us precise delta changes.
	cpuPerc, err := cpu.Percent(0, false)
	var cpuVal float64
	if err == nil && len(cpuPerc) > 0 {
		cpuVal = cpuPerc[0]
	}

	// Memory stats
	vMem, err := mem.VirtualMemory()
	var memUsed, memTotal, memPerc float64
	if err == nil {
		// Use (Total - Available) for a consistent "Task Manager" feel.
		// This ensures the GB value matches the UsedPercent progress bar.
		actualUsed := vMem.Total - vMem.Available
		memUsed = float64(actualUsed) / (1024 * 1024 * 1024) 
		memTotal = float64(vMem.Total) / (1024 * 1024 * 1024)
		memPerc = vMem.UsedPercent
	}

	return Stats{
		CPUUsage:    cpuVal,
		MemoryUsed:  memUsed,
		MemoryTotal: memTotal,
		MemoryPerc:  memPerc,
	}
}
