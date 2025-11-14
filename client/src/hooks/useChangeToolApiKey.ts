import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";

// Hook for changing tool order API key
export function useChangeToolApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, apiKey }: { orderId: string; apiKey: string }) => {
      const response = await orderApi.changeToolApiKey(orderId, { apiKey });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
