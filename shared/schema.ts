import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default('user'),
  status: text("status").notNull().default('active'),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Tools table
export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  demo: text("demo"),
  slug: text("slug").notNull(),
  soldQuantity: integer("sold_quantity").default(0),
  viewCount: integer("view_count").default(0),
  status: integer("status").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Tool plans table
export const toolPlans = pgTable("tool_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: varchar("tool_id").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(), // -1 for permanent
});

// Tool images table
export const toolImages = pgTable("tool_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: varchar("tool_id").notNull(),
  fileUrl: text("file_url").notNull(),
});

// VPS table
export const vps = pgTable("vps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  description: text("description"),
  soldQuantity: integer("sold_quantity").default(0),
  viewCount: integer("view_count").default(0),
  status: integer("status").notNull().default(0),
  ram: integer("ram").notNull(),
  disk: integer("disk").notNull(),
  cpu: integer("cpu").notNull(),
  bandwidth: integer("bandwidth").notNull(),
  location: text("location"),
  os: text("os"),
  price: integer("price").notNull(),
  // Note: tags are handled as a virtual field in the API response, not stored in DB
});

// Proxies table
export const proxies = pgTable("proxies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  type: text("type").notNull().default('http'),
  location: text("location").notNull(),
  status: text("status").notNull().default('offline'),
  username: text("username"),
  isAnonymous: boolean("is_anonymous").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
});

export const insertVpsSchema = createInsertSchema(vps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProxySchema = createInsertSchema(proxies).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertVps = z.infer<typeof insertVpsSchema>;
export type Vps = typeof vps.$inferSelect & {
  tags?: string[];
};
export type InsertProxy = z.infer<typeof insertProxySchema>;
export type Proxy = typeof proxies.$inferSelect;
