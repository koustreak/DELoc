import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Component } from "@shared/schema";

export function useComponents() {
  return useQuery({
    queryKey: ["/api/components"],
  });
}

export function useComponent(id: number) {
  return useQuery({
    queryKey: [`/api/components/${id}`],
    enabled: !!id,
  });
}

export function useComponentLogs(id: number) {
  return useQuery({
    queryKey: [`/api/components/${id}/logs`],
    enabled: !!id,
  });
}

export function useComponentToggle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const response = await apiRequest("POST", `/api/components/${id}/status`, { enabled });
      return response.json();
    },
    onSuccess: (data: Component) => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: [`/api/components/${data.id}`] });
    },
  });
}

export function useComponentRestart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/components/${id}/restart`, {});
      return response.json();
    },
    onSuccess: (data: Component) => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: [`/api/components/${data.id}`] });
    },
  });
}
