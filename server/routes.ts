import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertToolSchema, insertVpsSchema, insertProxySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Get all users to find the matching user
      const users = await storage.getAllUsers();
      const user = users.find(u => u.username === username);
      
      // For demo purposes, we'll check against a simple password map
      // In a real application, this would be handled securely with hashed passwords
      const validCredentials: Record<string, string> = {
        "admin": "admin123",
        "user": "user123",
        "demo": "demo"
      };
      
      if (user && validCredentials[username] === password) {
        res.json({
          user: user,
          token: "mock-jwt-token-" + user.id,
          message: "Login successful"
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getNonAdminUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      // Log incoming request data to verify role field is received
      console.log("Received user creation data:", req.body);
      
      // Handle both username and fullname fields
      const userData = { ...req.body };
      if (userData.fullname && !userData.username) {
        userData.username = userData.fullname;
        delete userData.fullname;
      }
      
      // Handle role field - convert integer to string if needed
      if (typeof userData.role === 'number') {
        // Convert numeric role to string representation
        // 0 = 'user', 1 = 'admin', etc. (you can adjust this mapping as needed)
        userData.role = userData.role === 0 ? 'user' : 'admin';
      }
      
      // Log processed data
      console.log("Processed user data:", userData);
      
      const validatedData = insertUserSchema.parse(userData);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Error creating user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      // Log incoming request data
      console.log("Received user update data:", req.body);
      
      // Handle both username and fullname fields
      const userData = { ...req.body };
      if (userData.fullname && !userData.username) {
        userData.username = userData.fullname;
        delete userData.fullname;
      }
      
      userData.role = 0;
      
      const validatedData = insertUserSchema.partial().parse(userData);
      const user = await storage.updateUser(req.params.id, validatedData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Tools routes
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getAllTools();
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Error fetching tools" });
    }
  });

  // VPS routes
  app.get("/api/vps", async (req, res) => {
    try {
      const vps = await storage.getAllVps();
      res.json(vps);
    } catch (error) {
      console.error("Error fetching VPS:", error);
      res.status(500).json({ message: "Error fetching VPS" });
    }
  });

  // Proxies routes
  app.get("/api/proxies", async (req, res) => {
    try {
      const proxies = await storage.getAllProxies();
      res.json(proxies);
    } catch (error) {
      console.error("Error fetching proxies:", error);
      res.status(500).json({ message: "Error fetching proxies" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
