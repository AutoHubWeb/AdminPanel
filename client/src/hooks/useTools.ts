import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toolApi } from "@/lib/api";
import type { Tool } from "@shared/schema";

// Fetch all tools
export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async (): Promise<Tool[]> => {
      const response = await toolApi.list();
      return response.data.data || [];
    },
  });
}

// Create a new tool
export function useCreateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (toolData: any): Promise<Tool> => {
      const response = await toolApi.create(toolData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

// Update a tool
export function useUpdateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<Tool> => {
      const response = await toolApi.update(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

// Delete a tool
export function useDeleteTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await toolApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

// Activate a tool
export function useActivateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await toolApi.active(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

// Pause a tool
export function usePauseTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await toolApi.pause(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}
