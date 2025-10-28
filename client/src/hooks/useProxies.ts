import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proxyApi } from "@/lib/api";
import type { Proxy } from "@shared/schema";

// Fetch all proxies
export function useProxies() {
  return useQuery({
    queryKey: ["proxies"],
    queryFn: async (): Promise<Proxy[]> => {
      const response = await proxyApi.list();
      // Handle the correct API response structure
      if (response.data && response.data.items) {
        return response.data.items;
      }
      return response.data || [];
    },
  });
}

// Fetch a single proxy by ID
export function useProxy(id: string) {
  return useQuery({
    queryKey: ["proxy", id],
    queryFn: async (): Promise<Proxy> => {
      const response = await proxyApi.detail(id);
      // Handle the correct API response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 0, // Don't cache the data
    gcTime: 0, // Don't cache the data (cacheTime was renamed to gcTime in newer versions)
  });
}

// Create a new proxy
export function useCreateProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proxyData: any): Promise<Proxy> => {
      const response = await proxyApi.create(proxyData);
      // Handle the correct API response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
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
      // Handle the correct API response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
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