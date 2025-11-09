import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proxyApi } from "@/lib/api";
import type { Proxy } from "@shared/schema";

// Define the API response structure for list endpoint
interface ProxyListApiResponse {
  statusCode: number;
  data: {
    items: ApiProxy[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

// Define the complete Proxy structure from the API
interface ApiProxy {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  soldQuantity: number;
  viewCount: number;
  status: number;
  inventory: number;
  price: number;
  [key: string]: any; // Allow for additional fields
}

// Helper function to convert API Proxy to DB Proxy
const mapApiProxyToProxy = (item: ApiProxy): Proxy => ({
  id: item.id,
  name: item.name,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  description: item.description,
  soldQuantity: item.soldQuantity,
  viewCount: item.viewCount,
  status: item.status,
  inventory: item.inventory,
  price: item.price,
});

// Fetch all Proxies with optional search parameters and pagination
export function useProxies(searchParams?: { keyword?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["proxies", searchParams],
    queryFn: async (): Promise<{ items: Proxy[]; meta: any }> => {
      try {
        const response = await proxyApi.list(searchParams);
        
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          const proxyItems = response.data.items || [];
          // Calculate missing meta information
          const total = response.data.meta?.total ?? proxyItems.length;
          const page = response.data.meta?.page ?? searchParams?.page ?? 1;
          const limit = response.data.meta?.limit ?? searchParams?.limit ?? 10;
          const totalPages = response.data.meta?.totalPages ?? Math.ceil(total / limit);
          
          const meta = {
            total,
            page,
            limit,
            totalPages
          };
          
          // Map API response to ensure all fields are properly typed
          const mappedProxyItems: Proxy[] = proxyItems.map(mapApiProxyToProxy);
          
          return { items: mappedProxyItems, meta };
        }
        
        // Fallback for different response structures
        const data = response.data || response;
        const proxyItems = Array.isArray(data) ? data : [];
        const total = proxyItems.length;
        const page = searchParams?.page ?? 1;
        const limit = searchParams?.limit ?? 10;
        const totalPages = Math.ceil(total / limit);
        
        const meta = {
          total,
          page,
          limit,
          totalPages
        };
        
        // Map API response to ensure all fields are properly typed
        const mappedProxyItems: Proxy[] = proxyItems.map(mapApiProxyToProxy);
        
        return { items: mappedProxyItems, meta };
      } catch (error) {
        console.error("Error fetching proxy data:", error);
        // Return empty array on error to prevent app crashes
        const page = searchParams?.page ?? 1;
        const limit = searchParams?.limit ?? 10;
        
        return { 
          items: [], 
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 1
          }
        };
      }
    },
  });
}

// Create a new Proxy
export function useCreateProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proxyData: any): Promise<Proxy> => {
      const response = await proxyApi.create(proxyData);
      // Handle response based on actual API structure
      if (response.data && response.data.id) {
        // If response.data is already a Proxy object
        return mapApiProxyToProxy(response.data);
      } else if (response.data && response.data.data && response.data.data.items) {
        // If response.data has a nested data object (from interceptor)
        return mapApiProxyToProxy(response.data.data.items[0]);
      }
      // Fallback
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}

// Update a Proxy
export function useUpdateProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<Proxy> => {
      const response = await proxyApi.update(id, data);
      // The axios interceptor already extracts the data field, so we can use it directly
      return mapApiProxyToProxy(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}

// Delete a Proxy
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

// Activate a Proxy
export function useActivateProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await proxyApi.active(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}

// Pause a Proxy
export function usePauseProxy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await proxyApi.pause(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });
}
