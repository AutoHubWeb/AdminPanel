import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import type { User, InsertUser } from "@shared/schema";

interface ApiUser {
  id: string;
  code: string;
  fullname: string;
  email: string;
  phone: string | null;
  role: number;
  isLocked: number;
  accountBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface UserApiResponse {
  statusCode: number;
  data: {
    items: ApiUser[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

// Define the data structure for API calls
interface UserApiData {
  fullname: string;
  email: string;
  phone: string | null;
  role: number;
}

// Define the data structure for user creation API calls
interface UserCreateApiData extends UserApiData {
  password: string;
}

const transformApiUserToUser = (apiUser: ApiUser): User => {
  // Handle potentially missing or null values
  if (!apiUser) {
    return {
      id: '',
      username: '',
      email: '',
      phone: null,
      role: 'user',
      status: 'inactive',
      lastLogin: null,
      createdAt: '', // Should be string, not Date
    };
  }
  
  return {
    id: apiUser.id,
    username: apiUser.fullname,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role === 1 ? 'admin' : 'user',
    status: apiUser.isLocked === 0 ? 'active' : 'inactive',
    lastLogin: null, // API doesn't provide lastLogin in this response
    createdAt: apiUser.createdAt, // Keep as string
    accountBalance: apiUser.accountBalance, // Add account balance
  };
};

// Fetch all non-admin users with optional search and pagination
export function useUsers(searchParams?: { keyword?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["users", searchParams],
    queryFn: async (): Promise<{ items: User[]; meta: any }> => {
      try {
        const response = await userApi.list(searchParams);
        
        // Handle the nested data structure from the API
        if (response.data && response.data.items) {
          const userItems = response.data.items || [];
          // Calculate missing meta information
          const total = response.data.meta?.total ?? userItems.length;
          const page = response.data.meta?.page ?? searchParams?.page ?? 1;
          const limit = response.data.meta?.limit ?? searchParams?.limit ?? 10;
          const totalPages = response.data.meta?.totalPages ?? Math.ceil(total / limit);
          
          const meta = {
            total,
            page,
            limit,
            totalPages
          };
          
          return { 
            items: userItems.map(transformApiUserToUser), 
            meta 
          };
        }
        
        // Fallback for different response structures
        const data = response.data || response;
        const userItems = Array.isArray(data) ? data : [];
        const total = userItems.length;
        const page = searchParams?.page ?? 1;
        const limit = searchParams?.limit ?? 10;
        const totalPages = Math.ceil(total / limit);
        
        const meta = {
          total,
          page,
          limit,
          totalPages
        };
        
        return { 
          items: userItems.map(transformApiUserToUser), 
          meta 
        };
      } catch (error) {
        console.error("Error fetching users:", error);
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
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Only refetch when keyword changes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Create a new user
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: UserCreateApiData): Promise<User> => {
      // Send data directly to the API without mapping to InsertUser
      const response = await userApi.create(userData);
      // The axios interceptor already extracts the data property, so we can use response.data directly
      // Transform the response to match our User type
      const apiUser = response.data;
      return transformApiUserToUser(apiUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Update a user
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserApiData }): Promise<User> => {
      // Send data directly to the API without mapping to InsertUser
      const response = await userApi.update(id, data);
      // The axios interceptor already extracts the data property, so we can use response.data directly
      // Transform the response to match our User type
      const apiUser = response.data;
      return transformApiUserToUser(apiUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await userApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Lock a user
export function useLockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await userApi.lock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Unlock a user
export function useUnlockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await userApi.unlock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Update user balance
export function useUpdateUserBalance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: { amount: number; operation: number; reason: string } 
    }): Promise<any> => {
      const response = await userApi.updateBalance(id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users query to get updated balances
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
    },
  });
}
