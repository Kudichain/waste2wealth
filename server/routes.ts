import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import {
  insertFactorySchema,
  insertTaskSchema,
  insertTrashRecordSchema,
  insertSupportTicketSchema,
  insertSupportTicketMessageSchema,
  insertVendorProfileSchema,
} from "@shared/schema";
import { registerEnhancedRoutes } from "./enhancedRoutes";
import { registerVendorRoutes } from "./vendorRoutes";
import { registerFactoryRoutes } from "./factoryRoutes";
import { registerAdminRoutes } from "./adminRoutes";
import { registerReferralRoutes } from "./referralRoutes";
import { registerEventGalleryRoutes } from "./eventGalleryRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (no auth, no database required)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Statistics endpoint for landing page
  app.get('/api/stats', async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Leaderboard endpoint
  app.get('/api/leaderboard', async (_req, res) => {
    try {
      const leaderboard = await storage.getTopCollectors(5);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes - this route should work for both authenticated and unauthenticated users
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated via session
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.userId;
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
      
      if (!["collector", "vendor", "factory", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.post('/api/collectors/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const {
        firstName,
        lastName,
        phoneNumber,
        email,
        address,
        city,
        state,
      } = req.body;

      if (!firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ message: "First name, last name, and phone number are required" });
      }

      const locationParts = [address, city, state].filter(Boolean).map((part: string) => part.trim());
      const location = locationParts.length ? locationParts.join(", ") : undefined;

      const user = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        phoneNumber,
        email,
        location,
      });

      await storage.updateUserRole(userId, "collector");

      res.json(user);
    } catch (error) {
      console.error("Error updating collector profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/vendors/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getVendorProfile(userId);
      res.json({ user, profile });
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      res.status(500).json({ message: "Failed to fetch vendor profile" });
    }
  });

  app.post('/api/vendors/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const {
        businessName,
        contactFirstName,
        contactLastName,
        contactPhone,
        contactEmail,
        state,
        lga,
        ward,
        address,
        services,
      } = req.body;

      if (!businessName || !state || !lga) {
        return res.status(400).json({ message: "businessName, state, and lga are required" });
      }

      const profilePayload = insertVendorProfileSchema.parse({
        businessName,
        contactName: [contactFirstName, contactLastName].filter(Boolean).join(" ") || undefined,
        state,
        lga,
        ward,
        address,
        services,
        userId,
      });

      const locationParts = [address, ward, lga, state].filter(Boolean).map((part: string) => part.trim());
      const location = locationParts.length ? locationParts.join(", ") : undefined;

      const user = await storage.updateUserProfile(userId, {
        firstName: contactFirstName,
        lastName: contactLastName,
        phoneNumber: contactPhone,
        email: contactEmail,
        location,
      });

      await storage.updateUserRole(userId, "vendor");
      const profile = await storage.upsertVendorProfile(userId, {
        businessName: profilePayload.businessName,
        contactName: profilePayload.contactName,
        state: profilePayload.state,
        lga: profilePayload.lga,
        ward: profilePayload.ward,
        address: profilePayload.address,
        services: profilePayload.services,
      });

      res.json({
        user: {
          ...user,
          role: "vendor",
        },
        profile,
      });
    } catch (error: any) {
      console.error("Error updating vendor profile:", error);
      res.status(400).json({ message: error.message || "Failed to update vendor profile" });
    }
  });

  app.get('/api/vendors', isAuthenticated, async (_req, res) => {
    try {
      const entries = await storage.listVendors();
      const payload = entries.map(({ user, profile }) => ({
        id: user.id,
        username: user.username,
        businessName: profile.businessName,
        contactName: profile.contactName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
        phoneNumber: user.phoneNumber,
        email: user.email,
        state: profile.state,
        lga: profile.lga,
        ward: profile.ward,
        address: profile.address,
        location: user.location,
      }));
      res.json(payload);
    } catch (error) {
      console.error("Error listing vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
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

  // Trash record routes
  app.post('/api/trash-records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "collector") {
        return res.status(403).json({ message: "Only collectors can log trash submissions" });
      }

      const { vendorId, factoryId, trashType, weightKg, qualityNotes, metadata, reference } = req.body;

      if (!vendorId || !trashType || weightKg === undefined) {
        return res.status(400).json({ message: "vendorId, trashType, and weightKg are required" });
      }

      const numericWeight = Number(weightKg);
      if (!numericWeight || numericWeight <= 0) {
        return res.status(400).json({ message: "weightKg must be greater than 0" });
      }

      const payload = insertTrashRecordSchema.parse({
        collectorId: userId,
        vendorId,
        factoryId,
        trashType,
        weightKg: numericWeight,
        qualityNotes,
        metadata,
        reference,
        status: "pending_vendor_confirmation",
      });

      const record = await storage.createTrashRecord(payload);

      res.json(record);
    } catch (error) {
      console.error("Error creating trash record:", error);
      res.status(500).json({ message: "Failed to create trash record" });
    }
  });

  app.get('/api/trash-records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const filters: any = {
        status: req.query.status,
        reference: req.query.reference,
      };

      if (user.role === "collector") {
        filters.collectorId = userId;
      } else if (user.role === "vendor") {
        filters.vendorId = userId;
      } else if (user.role === "factory") {
        const factoryId = req.query.factoryId as string | undefined;
        if (!factoryId) {
          return res.status(400).json({ message: "factoryId is required for factory users" });
        }
        const factory = await storage.getFactory(factoryId);
        if (!factory || factory.ownerId !== userId) {
          return res.status(403).json({ message: "You can only view records for your factory" });
        }
        filters.factoryId = factoryId;
      }

      if (req.query.collectorId && user.role === "admin") {
        filters.collectorId = req.query.collectorId;
      }

      if (req.query.vendorId && (user.role === "admin" || user.role === "factory")) {
        filters.vendorId = req.query.vendorId;
      }

      if (req.query.factoryId && user.role === "admin") {
        filters.factoryId = req.query.factoryId;
      }

      const records = await storage.listTrashRecords(filters);
      res.json(records);
    } catch (error) {
      console.error("Error fetching trash records:", error);
      res.status(500).json({ message: "Failed to fetch trash records" });
    }
  });

  app.patch('/api/trash-records/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { status, committedPayout, vendorPayout, metadata } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const existing = await storage.getTrashRecord(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Trash record not found" });
      }

      if (user.role === "vendor" && existing.vendorId !== userId) {
        return res.status(403).json({ message: "You can only update records assigned to your vendor account" });
      }

      if (user.role === "factory") {
        if (!existing.factoryId) {
          return res.status(403).json({ message: "This record is not assigned to a factory" });
        }
        const factory = await storage.getFactory(existing.factoryId);
        if (!factory || factory.ownerId !== userId) {
          return res.status(403).json({ message: "You can only update records for your factory" });
        }
      }

      const allowedStatusesByRole: Record<string, string[]> = {
        vendor: ["vendor_confirmed", "in_transit"],
        factory: ["factory_received"],
        admin: ["vendor_confirmed", "in_transit", "factory_received", "payout_released", "cancelled"],
      };

      if (user.role !== "admin") {
        const allowed = allowedStatusesByRole[user.role || ""] || [];
        if (!allowed.includes(status)) {
          return res.status(403).json({ message: "You are not allowed to set this status" });
        }
      }

      const parsedCommitted = committedPayout !== undefined ? Number(committedPayout) : undefined;
      const parsedVendor = vendorPayout !== undefined ? Number(vendorPayout) : undefined;

      const updated = await storage.updateTrashRecordStatus(req.params.id, status, {
        committedPayout: parsedCommitted,
        vendorPayout: parsedVendor,
        metadata,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating trash record status:", error);
      res.status(500).json({ message: "Failed to update trash record status" });
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
      
      const { amount, description, reference } = req.body;
      const numericAmount = Number(amount);
      
      if (!numericAmount || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid redemption amount" });
      }

      if (user.role === "collector") {
        if (numericAmount !== 1) {
          return res.status(400).json({ message: "Collectors can only withdraw exactly 1 KOBO" });
        }
        const transaction = await storage.collectorWithdraw(userId, reference || `COL-WD-${Date.now()}`);
        return res.json(transaction);
      }

      const transaction = await storage.deductCoins(userId, numericAmount, description || "Wallet redemption", {
        reference: reference || `WD-${Date.now()}`,
      });
      res.json(transaction);
    } catch (error: any) {
      console.error("Error redeeming coins:", error);
      res.status(400).json({ message: error.message || "Failed to redeem coins" });
    }
  });

  app.post('/api/wallet/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, category, description, metadata } = req.body;
      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid purchase amount" });
      }

      const label = description || `Purchase: ${category || "wallet"}`;
      const transaction = await storage.purchaseService(userId, numericAmount, label, metadata);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error processing purchase:", error);
      res.status(400).json({ message: error.message || "Failed to process purchase" });
    }
  });

  app.post('/api/wallet/transfer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, targetUsername, description, metadata } = req.body;
      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid transfer amount" });
      }

      if (!targetUsername) {
        return res.status(400).json({ message: "targetUsername is required" });
      }

      const targetUser = await storage.getUserByUsername(targetUsername);
      if (!targetUser) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      if (targetUser.id === userId) {
        return res.status(400).json({ message: "Cannot transfer to the same account" });
      }

      const transferDescription = description || `Transfer to ${targetUser.username}`;
      const result = await storage.transferCoins(userId, targetUser.id, numericAmount, transferDescription, {
        metadata,
      });

      res.json({
        debit: result.debit,
        credit: result.credit,
        recipient: {
          id: targetUser.id,
          username: targetUser.username,
          role: targetUser.role,
        },
      });
    } catch (error: any) {
      console.error("Error processing transfer:", error);
      res.status(400).json({ message: error.message || "Failed to process transfer" });
    }
  });

  app.post('/api/admin/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);

      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can disburse payouts" });
      }

      const { targetUserId, amount, description, reference, trashRecordId, transactionType } = req.body;

      if (!targetUserId || !amount || !description) {
        return res.status(400).json({ message: "targetUserId, amount, and description are required" });
      }

      const transaction = await storage.adminDisbursePayout(adminId, {
        targetUserId,
        amount: Number(amount),
        description,
        reference: reference || `PAYOUT-${Date.now()}`,
        trashRecordId,
        transactionType,
      });

      res.json(transaction);
    } catch (error: any) {
      console.error("Error disbursing payout:", error);
      res.status(400).json({ message: error.message || "Failed to disburse payout" });
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

  // Support tickets
  app.post('/api/support-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category, subject, description, priority } = req.body;
      const numericPriority = priority !== undefined ? Number(priority) : undefined;

      const ticketPayload = insertSupportTicketSchema.parse({
        creatorId: userId,
        category,
        subject,
        description,
        priority: numericPriority,
        status: "open",
      } as any);

      const ticket = await storage.createSupportTicket(ticketPayload);
      res.json(ticket);
    } catch (error: any) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({ message: error.message || "Failed to create support ticket" });
    }
  });

  app.get('/api/support-tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const filters: any = {
        status: req.query.status,
      };

      if (user.role === "admin") {
        if (req.query.creatorId) filters.creatorId = req.query.creatorId;
        if (req.query.assigneeId) filters.assigneeId = req.query.assigneeId;
      } else {
        filters.creatorId = userId;
      }

      const tickets = await storage.listSupportTickets(filters);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post('/api/support-tickets/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const ticket = await storage.getSupportTicket(req.params.id);

      if (!user || !ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (user.role !== "admin" && ticket.creatorId !== userId && ticket.assigneeId !== userId) {
        return res.status(403).json({ message: "You are not allowed to post on this ticket" });
      }

  const { message, attachments } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const payload = insertSupportTicketMessageSchema.parse({
        ticketId: ticket.id,
        authorId: userId,
        message,
        attachments,
      } as any);

      const created = await storage.addSupportTicketMessage(payload);
      res.json(created);
    } catch (error) {
      console.error("Error posting ticket message:", error);
      res.status(500).json({ message: "Failed to post message" });
    }
  });

  app.patch('/api/support-tickets/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const ticket = await storage.getSupportTicket(req.params.id);

      if (!user || !ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (user.role !== "admin" && ticket.assigneeId !== userId) {
        return res.status(403).json({ message: "You are not allowed to update this ticket" });
      }

      const { status, assigneeId } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await storage.updateSupportTicketStatus(ticket.id, status, assigneeId);
      res.json(updated);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ message: "Failed to update ticket" });
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

  // Profile Management Routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const {
        firstName,
        lastName,
        bio,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        postalCode,
        phoneNumber,
        idType,
        idNumber,
      } = req.body;

      // Handle profile image upload
      let profileImageUrl: string | undefined;
      if (req.file) {
        // Save file and get URL
        const filename = `profile-${userId}-${Date.now()}`;
        // In a real app, this would upload to cloud storage
        profileImageUrl = `/uploads/profiles/${filename}`;
      }

      const updateData: any = {
        id: userId,
        firstName,
        lastName,
        bio,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).getTime() : undefined,
        gender,
        address,
        city,
        state,
        postalCode,
        phoneNumber,
        idType,
        idNumber,
      };

      if (profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl;
      }

      const updated = await storage.updateUserProfile(userId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Vendor Profile Routes
  app.get('/api/vendor-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const profile = await storage.getVendorProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      res.status(500).json({ message: "Failed to fetch vendor profile" });
    }
  });

  app.put('/api/vendor-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const {
        businessName,
        contactName,
        contactPhone,
        address,
        state,
        lga,
        ward,
        businessRegistrationNumber,
        taxId,
        yearsInBusiness,
        services,
        description,
        operatingHours,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankCode,
      } = req.body;

      // Handle file uploads
      let businessLogo: string | undefined;
      let businessCertificate: string | undefined;

      if (req.files?.businessLogo) {
        const filename = `logo-${userId}-${Date.now()}`;
        businessLogo = `/uploads/vendor-logos/${filename}`;
      }

      if (req.files?.businessCertificate) {
        const filename = `cert-${userId}-${Date.now()}`;
        businessCertificate = `/uploads/vendor-certificates/${filename}`;
      }

      const updateData: any = {
        businessName,
        contactName,
        contactPhone,
        address,
        state,
        lga,
        ward,
        businessRegistrationNumber,
        taxId,
        yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : undefined,
        services: services ? (typeof services === 'string' ? JSON.parse(services) : services) : undefined,
        description,
        operatingHours: operatingHours ? (typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours) : undefined,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankCode,
      };

      if (businessLogo) updateData.businessLogo = businessLogo;
      if (businessCertificate) updateData.businessCertificate = businessCertificate;

      const updated = await storage.upsertVendorProfile(userId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      res.status(500).json({ message: "Failed to update vendor profile" });
    }
  });

  // Register enhanced routes for profile, KYC, barcode, etc.
  registerEnhancedRoutes(app);
  
  // Register vendor-specific routes for transaction tokens
  registerVendorRoutes(app);
  console.log("✓ Vendor routes registered");
  
  // Register factory-specific routes for subscriptions and shipments
  registerFactoryRoutes(app);
  console.log("✓ Factory routes registered");
  
  // Register admin routes for payment rate management
  registerAdminRoutes(app);
  registerReferralRoutes(app);
  registerEventGalleryRoutes(app);
  console.log("✓ Admin routes registered");

  const httpServer = createServer(app);
  return httpServer;
}
