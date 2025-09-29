import { promises as fs } from 'fs';
import { join } from 'path';
import { type User, type InsertUser, type Tool, type Vps, type Proxy } from "@shared/schema";

// Mock storage implementation that reads from JSON file
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getNonAdminUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllTools(): Promise<Tool[]>;
  getAllVps(): Promise<Vps[]>;
  getAllProxies(): Promise<Proxy[]>;
}

export class MockStorage implements IStorage {
  private async readMockData() {
    try {
      const dataPath = join(process.cwd(), 'data', 'mockData.json');
      const data = await fs.readFile(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading mock data:', error);
      return { users: [], tools: [], vps: [], proxies: [] };
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const mockData = await this.readMockData();
      const user = mockData.users.find((u: User) => u.id === id);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const mockData = await this.readMockData();
      const user = mockData.users.find((u: User) => u.username === username);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return user;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const mockData = await this.readMockData();
      const newUser: User = {
        id: `${mockData.users.length + 1}`,
        username: userData.username,
        email: userData.email,
        phone: userData.phone ?? null,
        role: userData.role ?? 'user',
        status: userData.status ?? 'active',
        createdAt: new Date(),
        lastLogin: null,
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const mockData = await this.readMockData();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockData.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getNonAdminUsers(): Promise<User[]> {
    try {
      const mockData = await this.readMockData();
      const nonAdminUsers = mockData.users.filter((user: User) => user.role !== 'admin');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return nonAdminUsers;
    } catch (error) {
      console.error('Error fetching non-admin users:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const mockData = await this.readMockData();
      const userIndex = mockData.users.findIndex((user: User) => user.id === id);
      
      if (userIndex === -1) return undefined;
      
      mockData.users[userIndex] = { ...mockData.users[userIndex], ...updateData };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockData.users[userIndex];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const mockData = await this.readMockData();
      const initialLength = mockData.users.length;
      mockData.users = mockData.users.filter((user: User) => user.id !== id);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockData.users.length < initialLength;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllTools(): Promise<Tool[]> {
    try {
      const mockData = await this.readMockData();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockData.tools;
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  }

  async getAllVps(): Promise<Vps[]> {
    try {
      const mockData = await this.readMockData();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockData.vps;
    } catch (error) {
      console.error('Error fetching VPS:', error);
      throw error;
    }
  }

  async getAllProxies(): Promise<Proxy[]> {
    try {
      const mockData = await this.readMockData();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockData.proxies;
    } catch (error) {
      console.error('Error fetching proxies:', error);
      throw error;
    }
  }
}

export const storage = new MockStorage();
