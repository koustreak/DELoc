import { InsertSystemMetrics, InsertComponentMetrics } from "@shared/schema";
import { storage } from "../storage";

// This is a mock metrics collector
// In a real implementation, this would use system tools to collect actual metrics

export class MetricsService {
  
  // Get current system metrics
  async getSystemMetrics(): Promise<InsertSystemMetrics> {
    // In a real implementation, this would use OS APIs to get actual system metrics
    const cpuUsage = Math.floor(Math.random() * 40) + 20; // 20-60%
    const memoryUsedGB = (Math.random() * 6 + 5).toFixed(1); // 5-11 GB
    const memoryTotalGB = "16 GB";
    const diskUsage = Math.floor(Math.random() * 30) + 30; // 30-60%
    const diskTotal = "512 GB";
    const networkIO = `${Math.floor(Math.random() * 20) + 15} MB/s`; // 15-35 MB/s
    
    return {
      timestamp: new Date(),
      cpuUsage,
      memoryUsage: `${memoryUsedGB} GB`,
      memoryTotal: memoryTotalGB,
      diskUsage,
      diskTotal,
      networkIO
    };
  }
  
  // Get metrics for a specific component
  async getComponentMetrics(componentId: number): Promise<InsertComponentMetrics | null> {
    const component = await storage.getComponent(componentId);
    if (!component || component.status === "stopped") {
      return null;
    }
    
    // In a real implementation, this would use Docker API to get actual container metrics
    const currentCpuUsage = component.cpuUsage ? 
      component.cpuUsage + (Math.random() * 6 - 3) : // Fluctuate +/- 3%
      Math.floor(Math.random() * 20);
    
    const currentMemoryUsage = component.memoryUsage ?
      component.memoryUsage :
      `${(Math.random() * 2 + 0.5).toFixed(1)} GB`;
      
    const taskCount = Math.floor(Math.random() * 50) + 10;
    
    return {
      componentId,
      timestamp: new Date(),
      cpuUsage: Math.max(1, Math.floor(currentCpuUsage)),
      memoryUsage: currentMemoryUsage,
      taskCount,
      additionalMetrics: {
        networkIO: `${Math.floor(Math.random() * 10) + 5} MB/s`,
        diskIO: `${Math.floor(Math.random() * 20) + 10} MB/s`
      }
    };
  }
  
  // Start collecting metrics at regular intervals
  startCollecting(interval = 60000): void {
    // Collect initial metrics
    this.collectAllMetrics();
    
    // Set up interval for regular collection
    setInterval(() => this.collectAllMetrics(), interval);
  }
  
  private async collectAllMetrics(): Promise<void> {
    try {
      // Collect system metrics
      const systemMetrics = await this.getSystemMetrics();
      await storage.createSystemMetrics(systemMetrics);
      
      // Collect metrics for each component
      const components = await storage.getComponents();
      for (const component of components) {
        if (component.status !== "stopped") {
          const componentMetrics = await this.getComponentMetrics(component.id);
          if (componentMetrics) {
            await storage.createComponentMetrics(componentMetrics);
          }
        }
      }
    } catch (error) {
      console.error("Error collecting metrics:", error);
    }
  }
}

export const metricsService = new MetricsService();
