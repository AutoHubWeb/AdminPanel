import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import type { Order } from "@shared/schema";

// Fetch all orders with optional search parameters and pagination
export function useOrders(searchParams?: { keyword?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["orders", searchParams],
    queryFn: async (): Promise<{ items: Order[]; meta: any }> => {
      try {
        const response = await orderApi.list(searchParams);
        
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          const orderItems = response.data.items || [];
          // Calculate missing meta information
          const total = response.data.meta?.total ?? orderItems.length;
          const page = response.data.meta?.page ?? searchParams?.page ?? 1;
          const limit = response.data.meta?.limit ?? searchParams?.limit ?? 10;
          const totalPages = response.data.meta?.totalPages ?? Math.ceil(total / limit);
          
          const meta = {
            total,
            page,
            limit,
            totalPages
          };
          
          return { items: orderItems, meta };
        }
        
        // Fallback for different response structures
        const data = response.data || response;
        const orderItems = Array.isArray(data) ? data : [];
        const total = orderItems.length;
        const page = searchParams?.page ?? 1;
        const limit = searchParams?.limit ?? 10;
        const totalPages = Math.ceil(total / limit);
        
        const meta = {
          total,
          page,
          limit,
          totalPages
        };
        
        return { items: orderItems, meta };
      } catch (error) {
        console.error("Error fetching order data:", error);
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
