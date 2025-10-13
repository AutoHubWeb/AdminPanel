import { useQuery } from "@tanstack/react-query";
import { transactionApi } from "@/lib/api";
import type { Transaction } from "@shared/schema";

// Hook to fetch admin transactions
export const useTransactions = (keyword?: string) => {
  return useQuery<Transaction[], Error>({
    queryKey: ["transactions", keyword],
    queryFn: async () => {
      try {
        const response = await transactionApi.list({ keyword });
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          return response.data.items;
        }
        // Fallback for different response structures
        const data = response.data || response;
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        // Return empty array on error to prevent app crashes
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });
};

// Hook to fetch user transactions
export const useUserTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: ["userTransactions"],
    queryFn: async () => {
      try {
        const response = await transactionApi.listUser();
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          return response.data.items;
        }
        // Fallback for different response structures
        const data = response.data || response;
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error("Error fetching user transactions:", error);
        // Return empty array on error to prevent app crashes
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });
};

// Hook to fetch top-up transactions
export const useTopUpTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: ["topUpTransactions"],
    queryFn: async () => {
      try {
        const response = await transactionApi.topUp();
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          return response.data.items;
        }
        // Fallback for different response structures
        const data = response.data || response;
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error("Error fetching top-up transactions:", error);
        // Return empty array on error to prevent app crashes
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });
};
