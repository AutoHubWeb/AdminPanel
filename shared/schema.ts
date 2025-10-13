// Pure frontend TypeScript interfaces (no database dependencies)
import { z } from "zod";

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
}

// Tool interface
export interface Tool {
  id: string;
  code: string;
  name: string;
  description: string | null;
  demo: string | null;
  slug: string;
  soldQuantity: number;
  viewCount: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// Tool plan interface
export interface ToolPlan {
  id: string;
  toolId: string;
  name: string;
  price: number;
  duration: number; // -1 for permanent
}

// Tool image interface
export interface ToolImage {
  id: string;
  toolId: string;
  fileUrl: string;
}

// VPS interface
export interface Vps {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  soldQuantity: number | null;
  viewCount: number | null;
  status: number;
  ram: number;
  disk: number;
  cpu: number;
  bandwidth: number;
  location: string | null;
  os: string | null;
  price: number;
  tags?: string[];
}

// Proxy interface
export interface Proxy {
  id: string;
  name: string;
  host: string;
  port: number;
  type: string;
  location: string;
  status: string;
  username: string | null;
  isAnonymous: boolean;
}

// Transaction interface - updated to match actual API response
export interface Transaction {
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
  // Add optional fields that might be in the API response
  [key: string]: any; // Allow for additional fields
}

// Insert types for forms
export type InsertUser = Omit<User, 'id' | 'lastLogin' | 'createdAt'>;
export type InsertTool = Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertVps = Omit<Vps, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertProxy = Omit<Proxy, 'id'>;

// Zod schemas for validation (simplified for frontend use)
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable(),
  role: z.string(),
  status: z.string()
});

export const insertToolSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  demo: z.string().nullable(),
  slug: z.string().min(1),
  soldQuantity: z.number(),
  viewCount: z.number(),
  status: z.number()
});

export const insertVpsSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  soldQuantity: z.number().nullable(),
  viewCount: z.number().nullable(),
  status: z.number(),
  ram: z.number(),
  disk: z.number(),
  cpu: z.number(),
  bandwidth: z.number(),
  location: z.string().nullable(),
  os: z.string().nullable(),
  price: z.number()
});

export const insertProxySchema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  port: z.number(),
  type: z.string(),
  location: z.string(),
  status: z.string(),
  username: z.string().nullable(),
  isAnonymous: z.boolean()
});
