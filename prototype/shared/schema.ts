import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (carried over from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Big data components model
export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  status: text("status").notNull().default("stopped"),
  containerId: text("container_id"),
  image: text("image").notNull(),
  ports: text("ports").array(),
  volumes: text("volumes").array(),
  networkName: text("network_name"),
  createdAt: timestamp("created_at"),
  uptime: text("uptime"),
  cpuUsage: integer("cpu_usage"),
  memoryUsage: text("memory_usage"),
  enabled: boolean("enabled").notNull().default(false),
  order: integer("order").notNull(),
  configuration: jsonb("configuration")
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true
});

// System metrics model
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: text("memory_usage").notNull(),
  memoryTotal: text("memory_total").notNull(),
  diskUsage: integer("disk_usage").notNull(),
  diskTotal: text("disk_total").notNull(),
  networkIO: text("network_io").notNull()
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true
});

// Component metrics model
export const componentMetrics = pgTable("component_metrics", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: text("memory_usage").notNull(),
  taskCount: integer("task_count"),
  additionalMetrics: jsonb("additional_metrics")
});

export const insertComponentMetricsSchema = createInsertSchema(componentMetrics).omit({
  id: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;

export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;
export type SystemMetrics = typeof systemMetrics.$inferSelect;

export type InsertComponentMetrics = z.infer<typeof insertComponentMetricsSchema>;
export type ComponentMetrics = typeof componentMetrics.$inferSelect;

// Status type
export const ComponentStatus = z.enum(["running", "stopped", "warning", "error"]);
export type ComponentStatusType = z.infer<typeof ComponentStatus>;
