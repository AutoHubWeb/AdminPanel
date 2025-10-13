import axios from "axios";
import type { User, InsertUser } from "@shared/schema";

const API_BASE_URL = "https://shopnro.hitly.click/api/v1";

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
    // If response.data is an object with a data property, return that
    if (response.data && response.data.data) {
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
  create: (data: InsertUser) => apiClient.post("/users", data),
  list: (params?: { keyword?: string }) => apiClient.get("/users", { params }),
  update: (id: string, data: Partial<InsertUser>) => apiClient.put(`/users/${id}`, data),
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
  list: () => apiClient.get("/tools"),
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
  list: () => apiClient.get("/vps"),
  detail: (id: string) => apiClient.get(`/vps/${id}`),
  update: (id: string, data: any) => apiClient.put(`/vps/${id}`, data),
  active: (id: string) => apiClient.put(`/vps/${id}/active`),
  pause: (id: string) => apiClient.put(`/vps/${id}/pause`),
  delete: (id: string) => apiClient.delete(`/vps/${id}`),
};

// Proxy APIs
export const proxyApi = {
  create: (data: any) => apiClient.post("/proxies", data),
  list: () => apiClient.get("/proxies"),
  detail: (id: string) => apiClient.get(`/proxies/${id}`),
  update: (id: string, data: any) => apiClient.put(`/proxies/${id}`, data),
  active: (id: string) => apiClient.put(`/proxies/${id}/active`),
  pause: (id: string) => apiClient.put(`/proxies/${id}/pause`),
  delete: (id: string) => apiClient.delete(`/proxies/${id}`),
};

// Transaction APIs
export const transactionApi = {
  list: (params?: { keyword?: string }) => apiClient.get("/transactions", { params }),
  listUser: () => apiClient.get("/transactions/me"),
  topUp: () => apiClient.get("/transactions/top-up"),
};

export default apiClient;
