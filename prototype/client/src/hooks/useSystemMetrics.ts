import { useQuery } from "@tanstack/react-query";
import { SystemMetrics, ComponentMetrics } from "@shared/schema";

export function useSystemMetrics() {
  return useQuery<SystemMetrics>({
    queryKey: ["/api/metrics/system"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useSystemMetricsHistory(limit = 24) {
  return useQuery<SystemMetrics[]>({
    queryKey: [`/api/metrics/system/history?limit=${limit}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useComponentMetrics(id: number) {
  return useQuery<ComponentMetrics[]>({
    queryKey: [`/api/metrics/components/${id}`],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!id,
  });
}

export function useComponentMetricsHistory(id: number, limit = 24) {
  return useQuery<ComponentMetrics[]>({
    queryKey: [`/api/metrics/components/${id}/history?limit=${limit}`],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!id,
  });
}
