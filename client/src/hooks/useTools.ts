import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toolApi } from "@/lib/api";
import type { Tool } from "@shared/schema";

// Extended Tool type to include API response fields
interface ExtendedTool extends Tool {
  images?: Array<{
    id: string;
    fileUrl: string;
  }>;
  plans?: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
}

// Type for API response
interface ToolApiResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  demo: string;
  slug: string;
  soldQuantity: number;
  viewCount: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    fileUrl: string;
  }>;
  plans: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
}

interface ToolsResponse {
  statusCode: number;
  data: {
    items: ToolApiResponse[];
    meta: {
      total: number;
      page: number;
    };
  };
  message: string;
}

// Transform API tool to match our Tool type
const transformApiToolToTool = (apiTool: ToolApiResponse): ExtendedTool => {
  return {
    id: apiTool.id,
    code: apiTool.code,
    name: apiTool.name,
    description: apiTool.description,
    demo: apiTool.demo,
    slug: apiTool.slug,
    soldQuantity: apiTool.soldQuantity,
    viewCount: apiTool.viewCount,
    status: apiTool.status,
    createdAt: new Date(apiTool.createdAt),
    updatedAt: new Date(apiTool.updatedAt),
    images: apiTool.images,
    plans: apiTool.plans,
  };
};

// Fetch all tools
export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async (): Promise<ExtendedTool[]> => {
      try {
        console.log("Fetching tools");
        const response = await toolApi.list();
        console.log("API Response:", response);
        const apiResponse = response.data as ToolsResponse;
        
        if (apiResponse.statusCode === 200 && apiResponse.data?.items) {
          console.log("Returning tools:", apiResponse.data.items);
          return apiResponse.data.items.map(transformApiToolToTool);
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching tools:", error);
        return [];
      }
    },
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Create a new tool
export function useCreateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (toolData: any): Promise<ExtendedTool> => {
      console.log("Creating tool with data:", toolData);
      const response = await toolApi.create(toolData);
      console.log("Create tool response:", response);
      const apiTool = response.data.data as ToolApiResponse;
      return transformApiToolToTool(apiTool);
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
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<ExtendedTool> => {
      console.log("Updating tool with data:", id, data);
      const response = await toolApi.update(id, data);
      console.log("Update tool response:", response);
      const apiTool = response.data.data as ToolApiResponse;
      return transformApiToolToTool(apiTool);
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
