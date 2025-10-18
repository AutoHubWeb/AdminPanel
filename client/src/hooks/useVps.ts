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
    };
  };
  message: string;
}

// Define the API response structure for create/update endpoints
interface VpsItemApiResponse {
  statusCode: number;
  data: ApiVps;
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

// Fetch all VPS
export function useVps() {
  return useQuery({
    queryKey: ["vps"],
    queryFn: async (): Promise<Vps[]> => {
      try {
        const response = await vpsApi.list();
        console.log("VPS API Response:", response);
        
        // Access the items directly from response.data.items
        const vpsItems = response.data?.items || [];
        
        // Map API response to ensure all fields are properly typed
        const mappedVpsItems: Vps[] = vpsItems.map(mapApiVpsToVps);
        
        console.log("Mapped VPS Items:", mappedVpsItems);
        return mappedVpsItems;
      } catch (error) {
        console.error("Error fetching VPS data:", error);
        throw error;
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
      const apiResponse = response.data as VpsItemApiResponse;
      return mapApiVpsToVps(apiResponse.data);
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
      const apiResponse = response.data as VpsItemApiResponse;
      return mapApiVpsToVps(apiResponse.data);
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
