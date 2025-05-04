import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dockerService } from "./services/docker";
import { metricsService } from "./services/metrics";
import { ComponentStatus } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize metrics collection
  metricsService.startCollecting(30000); // Collect metrics every 30 seconds
  
  // API routes for components
  app.get("/api/components", async (req: Request, res: Response) => {
    try {
      const components = await storage.getComponents();
      res.json(components);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });
  
  app.get("/api/components/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const component = await storage.getComponent(id);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      res.json(component);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch component" });
    }
  });
  
  // Update component status (start/stop)
  app.post("/api/components/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const schema = z.object({
        enabled: z.boolean(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      
      const { enabled } = result.data;
      const component = await storage.getComponent(id);
      
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      // Update component status
      let success = false;
      let newStatus: z.infer<typeof ComponentStatus> = "stopped";
      
      if (enabled) {
        success = await dockerService.startContainer(component);
        newStatus = "running";
      } else {
        success = await dockerService.stopContainer(component);
        newStatus = "stopped";
      }
      
      if (success) {
        const updatedComponent = await storage.updateComponent(id, {
          status: newStatus,
          enabled
        });
        
        res.json(updatedComponent);
      } else {
        res.status(500).json({ message: `Failed to ${enabled ? 'start' : 'stop'} component` });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update component status" });
    }
  });
  
  // Restart component
  app.post("/api/components/:id/restart", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const component = await storage.getComponent(id);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      const success = await dockerService.restartContainer(component);
      
      if (success) {
        const updatedComponent = await storage.updateComponent(id, {
          status: "running",
          enabled: true
        });
        
        res.json(updatedComponent);
      } else {
        res.status(500).json({ message: "Failed to restart component" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to restart component" });
    }
  });
  
  // Get component logs
  app.get("/api/components/:id/logs", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const component = await storage.getComponent(id);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      if (!component.containerId) {
        return res.status(400).json({ message: "Component is not running" });
      }
      
      const logs = await dockerService.getContainerLogs(component.containerId);
      res.json({ logs });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch component logs" });
    }
  });
  
  // API routes for system metrics
  app.get("/api/metrics/system", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });
  
  app.get("/api/metrics/system/history", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 24;
      const history = await storage.getSystemMetricsHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics history" });
    }
  });
  
  // API routes for component metrics
  app.get("/api/metrics/components/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const metrics = await storage.getComponentMetrics(id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch component metrics" });
    }
  });
  
  app.get("/api/metrics/components/:id/history", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const limit = parseInt(req.query.limit as string, 10) || 24;
      const history = await storage.getComponentMetricsHistory(id, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch component metrics history" });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
