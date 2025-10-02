import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import type { User, InsertUser } from "@shared/schema";

// Type for API response
interface UserApiResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullname: string;
  email: string;
  role: number;
  isLocked: number;
  accountBalance: number;
}

interface UsersResponse {
  statusCode: number;
  data: {
    items: UserApiResponse[];
    meta: {
      total: number;
      page: number;
    };
  };
  message: string;
}

// Transform API user to match our User type
const transformApiUserToUser = (apiUser: UserApiResponse): User => {
  // Check if apiUser is defined
  if (!apiUser) {
    // Return a default user object if apiUser is undefined
    return {
      id: '',
      username: '',
      email: '',
      phone: null,
      role: 'user',
      status: 'active',
      lastLogin: null,
      createdAt: new Date(),
    };
  }
  
  return {
    id: apiUser.id,
    username: apiUser.fullname,
    email: apiUser.email,
    phone: null, // API doesn't provide phone in this response
    role: apiUser.role === 0 ? 'user' : 'admin',
    status: apiUser.isLocked === 0 ? 'active' : 'inactive',
    lastLogin: null, // API doesn't provide lastLogin in this response
    createdAt: new Date(apiUser.createdAt),
  };
};

// Fetch all non-admin users with optional search
export function useUsers(keyword?: string) {
  return useQuery({
    queryKey: ["users", keyword],
    queryFn: async (): Promise<User[]> => {
      try {
        console.log("Fetching users with keyword:", keyword);
        const response = await userApi.list({ keyword });
        console.log("API Response:", response);
        const apiResponse = response.data as UsersResponse;
        
        if (apiResponse.statusCode === 200 && apiResponse.data?.items) {
          console.log("Returning users:", apiResponse.data.items);
          return apiResponse.data.items.map(transformApiUserToUser);
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
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
    mutationFn: async (userData: InsertUser): Promise<User> => {
      const response = await userApi.create(userData);
      // Check if response data exists and has the expected structure
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response structure from server");
      }
      // Transform the response to match our User type
      const apiUser = response.data.data as UserApiResponse;
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertUser> }): Promise<User> => {
      const response = await userApi.update(id, data);
      // Check if response data exists and has the expected structure
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response structure from server");
      }
      // Transform the response to match our User type
      const apiUser = response.data.data as UserApiResponse;
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
