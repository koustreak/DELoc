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
	go m.monitorLoop()
}

// monitorLoop fetches system stats at regular intervals and emits them via Wails events.
func (m *Manager) monitorLoop() {
	for {
		select {
		case <-m.ctx.Done():
			return
		default:
			stats := m.getSystemStats()
			runtime.EventsEmit(m.ctx, "system:stats", stats)
		}
	}
}

// getSystemStats collects CPU and Memory data.
func (m *Manager) getSystemStats() Stats {
	cpuVal := m.cpuPercent()

	vMem, err := mem.VirtualMemory()
	var memUsed, memTotal, memPerc float64
	if err == nil {
		// GNOME System Monitor formula: Total - Free - Buffers - Cached + Shmem
		// In gopsutil terms: vMem.Used + vMem.Shared
		// vMem.Used = Total - Free - Buffers - Cached (Shmem is folded into Cached by kernel)
		// vMem.Shared = Shmem — added back because GNOME treats it as process-owned memory
		actualUsed := vMem.Used + vMem.Shared
		// Divide by 1e9 (GB) not 1024³ (GiB) — GNOME System Monitor uses decimal GB.
		// That 7.37% difference is exactly the gap between "7.5" and "8.1".
		const gb = 1_000_000_000.0
		memUsed = float64(actualUsed) / gb
		memTotal = float64(vMem.Total) / gb
		memPerc = (float64(actualUsed) / float64(vMem.Total)) * 100
	}

	return Stats{
		CPUUsage:    cpuVal,
		MemoryUsed:  memUsed,
		MemoryTotal: memTotal,
		MemoryPerc:  memPerc,
	}
}

// cpuPercent computes CPU usage over a 1-second window using cpu.Times() directly.
// It includes iowait in the busy time, matching the behaviour of GNOME System Monitor
// and htop on Linux — which is what users expect to see.
func (m *Manager) cpuPercent() float64 {
	t1, err := cpu.Times(false)
	if err != nil || len(t1) == 0 {
		return 0
	}

	time.Sleep(1 * time.Second)

	t2, err := cpu.Times(false)
	if err != nil || len(t2) == 0 {
		return 0
	}

	c1, c2 := t1[0], t2[0]

	deltaUser := c2.User - c1.User
	deltaNice := c2.Nice - c1.Nice
	deltaSystem := c2.System - c1.System
	deltaIdle := c2.Idle - c1.Idle
	deltaIowait := c2.Iowait - c1.Iowait
	deltaIrq := c2.Irq - c1.Irq
	deltaSoftirq := c2.Softirq - c1.Softirq
	deltaSteal := c2.Steal - c1.Steal

	total := deltaUser + deltaNice + deltaSystem + deltaIdle +
		deltaIowait + deltaIrq + deltaSoftirq + deltaSteal

	if total == 0 {
		return 0
	}

	// Busy = everything except idle.
	// iowait is included so the value matches GNOME System Monitor on Linux.
	busy := deltaUser + deltaNice + deltaSystem + deltaIowait +
		deltaIrq + deltaSoftirq + deltaSteal

	return (busy / total) * 100
}
