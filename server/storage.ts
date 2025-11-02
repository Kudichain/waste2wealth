// Integration: blueprint:javascript_database and blueprint:javascript_log_in_with_replit
import {
  users,
  factories,
  tasks,
  transactions,
  wallets,
  type User,
  type UpsertUser,
  type Factory,
  type InsertFactory,
  type Task,
  type InsertTask,
  type Transaction,
  type InsertTransaction,
  type Wallet,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: "collector" | "factory" | "admin"): Promise<User>;
  
  // Factory operations
  createFactory(factory: InsertFactory): Promise<Factory>;
  getFactory(id: string): Promise<Factory | undefined>;
  getFactories(): Promise<Factory[]>;
  updateFactory(id: string, data: Partial<InsertFactory>): Promise<Factory>;
  verifyFactory(id: string): Promise<Factory>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: string): Promise<Task | undefined>;
  getTasks(filters?: { status?: string; type?: string }): Promise<Task[]>;
  getTasksByFactory(factoryId: string): Promise<Task[]>;
  getTasksByCollector(collectorId: string): Promise<Task[]>;
  acceptTask(taskId: string, collectorId: string): Promise<Task>;
  completeTask(taskId: string): Promise<Task>;
  verifyTask(taskId: string, verificationCode: string): Promise<Task>;
  
  // Wallet operations
  getOrCreateWallet(userId: string): Promise<Wallet>;
  getWalletBalance(userId: string): Promise<number>;
  addCoins(userId: string, amount: number, description: string, taskId?: string): Promise<Transaction>;
  deductCoins(userId: string, amount: number, description: string): Promise<Transaction>;
  
  // Transaction operations
  getTransactions(userId: string): Promise<Transaction[]>;
  
  // Stats
  getUserStats(userId: string): Promise<{
    tasksCompleted: number;
    totalEarnings: number;
    balance: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: "collector" | "factory" | "admin"): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Factory operations
  async createFactory(factory: InsertFactory): Promise<Factory> {
    const [newFactory] = await db.insert(factories).values(factory).returning();
    return newFactory;
  }

  async getFactory(id: string): Promise<Factory | undefined> {
    const [factory] = await db.select().from(factories).where(eq(factories.id, id));
    return factory;
  }

  async getFactories(): Promise<Factory[]> {
    return await db.select().from(factories);
  }

  async updateFactory(id: string, data: Partial<InsertFactory>): Promise<Factory> {
    const [factory] = await db
      .update(factories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(factories.id, id))
      .returning();
    return factory;
  }

  async verifyFactory(id: string): Promise<Factory> {
    const [factory] = await db
      .update(factories)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(factories.id, id))
      .returning();
    return factory;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, verificationCode })
      .returning();
    return newTask;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasks(filters?: { status?: string; type?: string }): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (filters?.status) {
      query = query.where(eq(tasks.status, filters.status as any)) as any;
    }
    
    return await query.orderBy(desc(tasks.createdAt));
  }

  async getTasksByFactory(factoryId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.factoryId, factoryId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByCollector(collectorId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.collectorId, collectorId))
      .orderBy(desc(tasks.createdAt));
  }

  async acceptTask(taskId: string, collectorId: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({
        collectorId,
        status: "accepted",
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.status, "available")))
      .returning();
    return task;
  }

  async completeTask(taskId: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }

  async verifyTask(taskId: string, verificationCode: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({
        status: "verified",
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.verificationCode, verificationCode)
      ))
      .returning();
    
    if (task && task.collectorId) {
      // Award coins to collector
      await this.addCoins(
        task.collectorId,
        task.reward,
        `Task completed: ${task.type} waste collection`,
        taskId
      );
    }
    
    return task;
  }

  // Wallet operations
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    const [existing] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (existing) return existing;
    
    const [wallet] = await db
      .insert(wallets)
      .values({ userId, balance: 0 })
      .returning();
    return wallet;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  async addCoins(userId: string, amount: number, description: string, taskId?: string): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId);
    
    // Update wallet balance
    await db
      .update(wallets)
      .set({ 
        balance: wallet.balance + amount,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId));
    
    // Create transaction record
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: "earn",
        amount,
        description,
        taskId,
      })
      .returning();
    
    return transaction;
  }

  async deductCoins(userId: string, amount: number, description: string): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }
    
    // Update wallet balance
    await db
      .update(wallets)
      .set({ 
        balance: wallet.balance - amount,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId));
    
    // Create transaction record
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: "redeem",
        amount: -amount,
        description,
      })
      .returning();
    
    return transaction;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getUserStats(userId: string): Promise<{
    tasksCompleted: number;
    totalEarnings: number;
    balance: number;
  }> {
    const completedTasks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(and(
        eq(tasks.collectorId, userId),
        eq(tasks.status, "verified")
      ));
    
    const earnings = await db
      .select({ total: sql<number>`sum(amount)::int` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, "earn")
      ));
    
    const wallet = await this.getOrCreateWallet(userId);
    
    return {
      tasksCompleted: completedTasks[0]?.count || 0,
      totalEarnings: earnings[0]?.total || 0,
      balance: wallet.balance,
    };
  }
}

export const storage = new DatabaseStorage();
