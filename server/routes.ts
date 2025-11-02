// Integration: blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFactorySchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!["collector", "factory", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Factory routes
  app.post('/api/factories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Verify user has factory role
      if (!user || (user.role !== "factory" && user.role !== "admin")) {
        return res.status(403).json({ message: "Only factory owners can create factories" });
      }
      
      const factoryData = insertFactorySchema.parse({ ...req.body, ownerId: userId });
      const factory = await storage.createFactory(factoryData);
      res.json(factory);
    } catch (error) {
      console.error("Error creating factory:", error);
      res.status(500).json({ message: "Failed to create factory" });
    }
  });

  app.get('/api/factories', async (req, res) => {
    try {
      const factories = await storage.getFactories();
      res.json(factories);
    } catch (error) {
      console.error("Error fetching factories:", error);
      res.status(500).json({ message: "Failed to fetch factories" });
    }
  });

  app.get('/api/factories/:id', async (req, res) => {
    try {
      const factory = await storage.getFactory(req.params.id);
      if (!factory) {
        return res.status(404).json({ message: "Factory not found" });
      }
      res.json(factory);
    } catch (error) {
      console.error("Error fetching factory:", error);
      res.status(500).json({ message: "Failed to fetch factory" });
    }
  });

  // Task routes
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse(req.body);
      
      // Verify the factory belongs to the authenticated user
      const factory = await storage.getFactory(taskData.factoryId);
      if (!factory) {
        return res.status(404).json({ message: "Factory not found" });
      }
      
      if (factory.ownerId !== userId) {
        return res.status(403).json({ message: "You can only create tasks for your own factories" });
      }
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', async (req, res) => {
    try {
      const { status, type } = req.query;
      const tasks = await storage.getTasks({
        status: status as string,
        type: type as string,
      });
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post('/api/tasks/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Verify user has collector role
      if (!user || (user.role !== "collector" && user.role !== "admin")) {
        return res.status(403).json({ message: "Only collectors can accept tasks" });
      }
      
      const task = await storage.acceptTask(req.params.id, userId);
      res.json(task);
    } catch (error) {
      console.error("Error accepting task:", error);
      res.status(500).json({ message: "Failed to accept task" });
    }
  });

  app.post('/api/tasks/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the task to verify collector assignment
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Only the assigned collector or admin can complete the task
      if (task.collectorId !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "Only the assigned collector can complete this task" });
      }
      
      const completedTask = await storage.completeTask(req.params.id);
      res.json(completedTask);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.post('/api/tasks/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { verificationCode } = req.body;
      
      // Get the task to verify factory ownership
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get the factory to verify ownership
      const factory = await storage.getFactory(task.factoryId);
      if (!factory) {
        return res.status(404).json({ message: "Factory not found" });
      }
      
      // Verify the factory belongs to the authenticated user
      if (factory.ownerId !== userId) {
        return res.status(403).json({ message: "Only the factory owner can verify tasks" });
      }
      
      const verifiedTask = await storage.verifyTask(req.params.id, verificationCode);
      res.json(verifiedTask);
    } catch (error) {
      console.error("Error verifying task:", error);
      res.status(500).json({ message: "Failed to verify task" });
    }
  });

  app.get('/api/tasks/factory/:factoryId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the factory to verify ownership
      const factory = await storage.getFactory(req.params.factoryId);
      if (!factory) {
        return res.status(404).json({ message: "Factory not found" });
      }
      
      // Only the factory owner or admin can view factory tasks
      if (factory.ownerId !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "You can only view your own factory's tasks" });
      }
      
      const tasks = await storage.getTasksByFactory(req.params.factoryId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching factory tasks:", error);
      res.status(500).json({ message: "Failed to fetch factory tasks" });
    }
  });

  app.get('/api/tasks/collector/:collectorId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only the collector themselves or admin can view their tasks
      if (req.params.collectorId !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "You can only view your own tasks" });
      }
      
      const tasks = await storage.getTasksByCollector(req.params.collectorId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching collector tasks:", error);
      res.status(500).json({ message: "Failed to fetch collector tasks" });
    }
  });

  // Wallet routes
  app.get('/api/wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getOrCreateWallet(userId);
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get('/api/wallet/balance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const balance = await storage.getWalletBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  app.post('/api/wallet/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { amount, description } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid redemption amount" });
      }
      
      const transaction = await storage.deductCoins(userId, amount, description);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error redeeming coins:", error);
      res.status(400).json({ message: error.message || "Failed to redeem coins" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Users can only view their own stats (or admin can view anyone's)
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
