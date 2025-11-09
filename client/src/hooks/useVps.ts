import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vpsApi } from "@/lib/api";
import type { Vps } from "@shared/schema";

// Define the API response structure for list endpoint
interface VpsListApiResponse {
  statusCode: number;
  data: {
    items: ApiVps[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

// Define the complete VPS structure from the API
interface ApiVps {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  soldQuantity: number | null;
  viewCount: number | null;
  status: number;
  ram: number;
  disk: number;
  cpu: number;
  bandwidth: number;
  location: string | null;
  os: string | null;
  price: number;
  tags?: string[];
}

// Helper function to convert API VPS to DB VPS
const mapApiVpsToVps = (item: ApiVps): Vps => ({
  id: item.id,
  name: item.name,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  description: item.description,
  soldQuantity: item.soldQuantity,
  viewCount: item.viewCount,
  status: item.status,
  ram: item.ram,
  disk: item.disk,
  cpu: item.cpu,
  bandwidth: item.bandwidth,
  location: item.location,
  os: item.os,
  price: item.price,
  tags: item.tags || []
});

// Fetch all VPS with optional search parameters and pagination
export function useVps(searchParams?: { keyword?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["vps", searchParams],
    queryFn: async (): Promise<{ items: Vps[]; meta: any }> => {
      try {
        const response = await vpsApi.list(searchParams);
        console.log("VPS API Response:", response);
        
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          const vpsItems = response.data.items || [];
          // Calculate missing meta information
          const total = response.data.meta?.total ?? vpsItems.length;
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
          const mappedVpsItems: Vps[] = vpsItems.map(mapApiVpsToVps);
          
          console.log("Mapped VPS Items:", mappedVpsItems);
          return { items: mappedVpsItems, meta };
        }
        
        // Fallback for different response structures
        const data = response.data || response;
        const vpsItems = Array.isArray(data) ? data : [];
        const total = vpsItems.length;
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
        const mappedVpsItems: Vps[] = vpsItems.map(mapApiVpsToVps);
        
        console.log("Mapped VPS Items:", mappedVpsItems);
        return { items: mappedVpsItems, meta };
      } catch (error) {
        console.error("Error fetching VPS data:", error);
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

// Create a new VPS
export function useCreateVps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vpsData: any): Promise<Vps> => {
      const response = await vpsApi.create(vpsData);
      // Handle response based on actual API structure
      if (response.data && response.data.id) {
        // If response.data is already a VPS object
        return mapApiVpsToVps(response.data);
      } else if (response.data && response.data.data && response.data.data.items) {
        // If response.data has a nested data object (from interceptor)
        return mapApiVpsToVps(response.data.data.items[0]);
      }
      // Fallback
      return response.data;
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
      // Handle response based on actual API structure
      if (response.data && response.data.id) {
        // If response.data is already a VPS object
        return mapApiVpsToVps(response.data);
      } else if (response.data && response.data.data) {
        // If response.data has a nested data object (from interceptor)
        return mapApiVpsToVps(response.data.data);
      }
      // Fallback
      return response.data;
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
