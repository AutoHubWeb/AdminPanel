import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proxyApi } from "@/lib/api";
import type { Proxy } from "@shared/schema";

// Fetch all proxies
export function useProxies() {
  return useQuery({
    queryKey: ["proxies"],
    queryFn: async (): Promise<Proxy[]> => {
      const response = await proxyApi.list();
      return response.data.data || [];
    },
  });
}

// Create a new proxy
export function useCreateProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proxyData: any): Promise<Proxy> => {
      const response = await proxyApi.create(proxyData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}

// Update a proxy
export function useUpdateProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<Proxy> => {
      const response = await proxyApi.update(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}

// Delete a proxy
export function useDeleteProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await proxyApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}
