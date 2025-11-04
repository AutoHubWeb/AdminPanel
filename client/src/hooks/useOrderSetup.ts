import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";

// Hook for setting up VPS orders
export function useSetupVpsOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: { ip: string; username: string; password: string } }) => {
      const response = await orderApi.setupVps(orderId, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Hook for setting up Proxy orders
export function useSetupProxyOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: { proxies: string; expiredAt: string } }) => {
      const response = await orderApi.setupProxy(orderId, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
