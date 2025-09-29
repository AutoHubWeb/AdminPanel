import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vpsApi } from "@/lib/api";
import type { Vps } from "@shared/schema";

// Fetch all VPS
export function useVps() {
  return useQuery({
    queryKey: ["vps"],
    queryFn: async (): Promise<Vps[]> => {
      const response = await vpsApi.list();
      return response.data.data || [];
    },
  });
}

// Create a new VPS
export function useCreateVps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vpsData: any): Promise<Vps> => {
      const response = await vpsApi.create(vpsData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
  });
}

// Update a VPS
export function useUpdateVps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<Vps> => {
      const response = await vpsApi.update(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
  });
}

// Delete a VPS
export function useDeleteVps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await vpsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
  });
}

// Activate a VPS
export function useActivateVps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await vpsApi.active(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
  });
}

// Pause a VPS
export function usePauseVps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await vpsApi.pause(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
  });
}
