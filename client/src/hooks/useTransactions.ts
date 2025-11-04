import { useQuery } from "@tanstack/react-query";
import { transactionApi } from "@/lib/api";
import type { Transaction } from "@shared/schema";

// Define the API response structure for list endpoint
interface TransactionListApiResponse {
  statusCode: number;
  data: {
    items: ApiTransaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

// Define the complete Transaction structure from the API
interface ApiTransaction {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  action: string;
  note: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    code: string;
  };
  [key: string]: any; // Allow for additional fields
}

// Helper function to convert API Transaction to DB Transaction
const mapApiTransactionToTransaction = (item: ApiTransaction): Transaction => ({
  id: item.id,
  code: item.code,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  amount: item.amount,
  balanceBefore: item.balanceBefore,
  balanceAfter: item.balanceAfter,
  action: item.action,
  note: item.note,
  user: item.user
});

// Fetch all Transactions with optional search parameters and pagination
export function useTransactions(searchParams?: { keyword?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["transactions", searchParams],
    queryFn: async (): Promise<{ items: Transaction[]; meta: any }> => {
      try {
        const response = await transactionApi.list(searchParams);
        
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          const transactionItems = response.data.items || [];
          // Calculate missing meta information
          const total = response.data.meta?.total ?? transactionItems.length;
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
          const mappedTransactionItems: Transaction[] = transactionItems.map(mapApiTransactionToTransaction);
          
          return { items: mappedTransactionItems, meta };
        }
        
        // Fallback for different response structures
        const data = response.data || response;
        const transactionItems = Array.isArray(data) ? data : [];
        const total = transactionItems.length;
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
        const mappedTransactionItems: Transaction[] = transactionItems.map(mapApiTransactionToTransaction);
        
        return { items: mappedTransactionItems, meta };
      } catch (error) {
        console.error("Error fetching transaction data:", error);
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
