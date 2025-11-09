import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toolApi } from "@/lib/api";
import type { Tool } from "@shared/schema";

// Define the API response structure for list endpoint
interface ToolListApiResponse {
  statusCode: number;
  data: {
    items: ApiTool[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

// Define the complete Tool structure from the API
interface ApiTool {
  id: string;
  code: string;
  name: string;
  description: string | null;
  demo: string | null;
  slug: string;
  soldQuantity: number;
  viewCount: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  plans: Array<{
    id: string;
    toolId: string;
    name: string;
    price: number;
    duration: number;
  }>;
  images: Array<{
    id: string;
    toolId: string;
    fileUrl: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Helper function to convert API Tool to DB Tool
const mapApiToolToTool = (item: ApiTool): Tool => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description,
  demo: item.demo,
  slug: item.slug,
  soldQuantity: item.soldQuantity,
  viewCount: item.viewCount,
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// Fetch all Tools with optional search parameters and pagination
export function useTools(searchParams?: { keyword?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["tools", searchParams],
    queryFn: async (): Promise<{ items: Tool[]; meta: any }> => {
      try {
        const response = await toolApi.list(searchParams);
        
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          const toolItems = response.data.items || [];
          // Calculate missing meta information
          const total = response.data.meta?.total ?? toolItems.length;
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
          const mappedToolItems: Tool[] = toolItems.map(mapApiToolToTool);
          
          return { items: mappedToolItems, meta };
        }
        
        // Fallback for different response structures
        const data = response.data || response;
        const toolItems = Array.isArray(data) ? data : [];
        const total = toolItems.length;
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
        const mappedToolItems: Tool[] = toolItems.map(mapApiToolToTool);
        
        return { items: mappedToolItems, meta };
      } catch (error) {
        console.error("Error fetching tool data:", error);
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
    // Add options to ensure data is fresh
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true
  });
}

// Create a new Tool
export function useCreateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (toolData: any): Promise<Tool> => {
      const response = await toolApi.create(toolData);
      // Handle response based on actual API structure
      if (response.data && response.data.id) {
        // If response.data is already a Tool object
        return mapApiToolToTool(response.data);
      } else if (response.data && response.data.data && response.data.data.id) {
        // If response.data has a nested data object (from interceptor)
        return mapApiToolToTool(response.data.data);
      }
      // Fallback
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      // Also try to refetch immediately
      queryClient.refetchQueries({ queryKey: ["tools"] });
    },
  });
}

// Update a Tool
export function useUpdateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<Tool> => {
      const response = await toolApi.update(id, data);
      // The axios interceptor already extracts the data field, so we can use it directly
      return mapApiToolToTool(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      // Also try to refetch immediately
      queryClient.refetchQueries({ queryKey: ["tools"] });
    },
  });
}

// Delete a Tool
export function useDeleteTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await toolApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      // Also try to refetch immediately
      queryClient.refetchQueries({ queryKey: ["tools"] });
    },
  });
}

// Activate a Tool
export function useActivateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await toolApi.active(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      // Also try to refetch immediately
      queryClient.refetchQueries({ queryKey: ["tools"] });
    },
  });
}

// Pause a Tool
export function usePauseTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await toolApi.pause(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      // Also try to refetch immediately
      queryClient.refetchQueries({ queryKey: ["tools"] });
    },
  });
}
