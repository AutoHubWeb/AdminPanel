import axios from "axios";
import type { User, InsertUser } from "@shared/schema";

// Define the data structure for user update API calls
interface UserUpdateData {
  fullname: string;
  email: string;
  phone: string | null;
  role: number;
}

// Define the data structure for user creation API calls
interface UserCreateData {
  fullname: string;
  email: string;
  phone: string | null;
  role: number;
  password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common response structures
apiClient.interceptors.response.use(
  (response) => {
    // If response.data is an object with a data property and it's not a login response, return that
    if (response.data && response.data.data && !response.config.url?.includes('/auth/login')) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (email: string, password: string) => 
    apiClient.post("/auth/login", { email, password }),
  register: (data: { fullname: string; email: string; password: string }) => 
    apiClient.post("/auth/register", data),
  me: () => apiClient.get("/auth/me"),
  updateMe: (data: { fullname: string; phone?: string }) => 
    apiClient.put("/auth/me", data),
  changePassword: (data: { oldPassword: string; newPassword: string }) => 
    apiClient.put("/auth/change-password", data),
  forgotPassword: (email: string) => 
    apiClient.post("/auth/forgot-password", { email }),
  refreshToken: (refreshToken: string) => 
    apiClient.post("/auth/refresh-tokens", { refreshToken }),
};

// User APIs
export const userApi = {
  create: (data: UserCreateData) => apiClient.post("/users", data),
  list: (params?: { keyword?: string; page?: number; limit?: number }) => apiClient.get("/users", { params }),
  update: (id: string, data: Partial<UserUpdateData>) => apiClient.put(`/users/${id}`, data),
  lock: (id: string) => apiClient.put(`/users/${id}/lock`),
  unlock: (id: string) => apiClient.put(`/users/${id}/unlock`),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  updateBalance: (id: string, data: { amount: number; operation: number; reason: string }) => 
    apiClient.post(`/users/${id}/balance`, data),
  resetPassword: (id: string, data: { password: string }) => 
    apiClient.post(`/users/${id}/reset-password`, data),
};

// Tool APIs
export const toolApi = {
  create: (data: any) => apiClient.post("/tools", data),
  list: (params?: { keyword?: string; page?: number; limit?: number }) => apiClient.get("/tools", { params }),
  detail: (id: string) => apiClient.get(`/tools/${id}`),
  listAdmin: () => apiClient.get("/tools/admin"),
  update: (id: string, data: any) => apiClient.put(`/tools/${id}`, data),
  active: (id: string) => apiClient.put(`/tools/${id}/active`),
  pause: (id: string) => apiClient.put(`/tools/${id}/pause`),
  delete: (id: string) => apiClient.delete(`/tools/${id}`),
};

// File APIs
export const fileApi = {
  uploadSingle: (formData: FormData) => 
    apiClient.post("/files/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadMultiple: (formData: FormData) => 
    apiClient.post("/files/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getFile: (filename: string) => apiClient.get(`/files/static/tool/${filename}`),
  delete: (id: string) => apiClient.delete(`/files/${id}`),
  deleteMultiple: (fileIds: string[]) => 
    apiClient.delete("/files/delete-multiple", { data: { fileIds } }),
};

// VPS APIs
export const vpsApi = {
  create: (data: any) => apiClient.post("/vps", data),
  list: (params?: { keyword?: string; page?: number; limit?: number }) => apiClient.get("/vps", { params }),
  detail: (id: string) => apiClient.get(`/vps/${id}`),
  update: (id: string, data: any) => apiClient.put(`/vps/${id}`, data),
  active: (id: string) => apiClient.put(`/vps/${id}/active`),
  pause: (id: string) => apiClient.put(`/vps/${id}/pause`),
  delete: (id: string) => apiClient.delete(`/vps/${id}`),
};

// Proxy APIs
export const proxyApi = {
  create: (data: any) => apiClient.post("/proxy", data),
  list: (params?: { keyword?: string; page?: number; limit?: number }) => apiClient.get("/proxy", { params }),
  detail: (id: string) => apiClient.get(`/proxy/${id}`),
  update: (id: string, data: any) => apiClient.put(`/proxy/${id}`, data),
  active: (id: string) => apiClient.put(`/proxy/${id}/active`),
  pause: (id: string) => apiClient.put(`/proxy/${id}/pause`),
  delete: (id: string) => apiClient.delete(`/proxy/${id}`),
};

// Transaction APIs
export const transactionApi = {
  list: (params?: { keyword?: string; page?: number; limit?: number }) => apiClient.get("/transactions", { params }),
  detail: (id: string) => apiClient.get(`/transactions/${id}`),
};

// Dashboard APIs
export const dashboardApi = {
  getSummary: () => apiClient.get("/dashboards/summary"),
  getUserSummary: (year: number) => apiClient.get(`/dashboards/summary-user?year=${year}`),
  getRevenueSummary: (year: number) => apiClient.get(`/dashboards/summary-revenue?year=${year}`),
};

// Order APIs
export const orderApi = {
  list: (params?: { keyword?: string; page?: number; limit?: number }) => apiClient.get("/orders", { params }),
  setupVps: (orderId: string, data: { ip: string; username: string; password: string }) => 
    apiClient.put(`/orders/${orderId}/setup-vps`, data),
  setupProxy: (orderId: string, data: { proxies: string; expiredAt: string }) => 
    apiClient.put(`/orders/${orderId}/setup-proxy`, data),
  // Add the new API endpoint for changing tool order API key
  changeToolApiKey: (orderId: string, data: { apiKey: string }) => 
    apiClient.put(`/orders/${orderId}/update-api-key`, data),
};

export default apiClient;
