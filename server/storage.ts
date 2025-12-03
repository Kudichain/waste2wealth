import {
  users,
  factories,
  tasks,
  transactions,
  wallets,
  trashRecords,
  supportTickets,
  supportTicketMessages,
  auditLogs,
  vendorProfiles,
  eventGalleryEvents,
  eventGalleryMedia,
  type User,
  type UpsertUser,
  type Factory,
  type InsertFactory,
  type Task,
  type InsertTask,
  type Transaction,
  type InsertTransaction,
  type Wallet,
  type TrashRecord,
  type InsertTrashRecord,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportTicketMessage,
  type InsertSupportTicketMessage,
  type VendorProfile,
  type InsertVendorProfile,
  type EventGalleryEvent,
  type InsertEventGalleryEvent,
  type EventGalleryMedia,
  type InsertEventGalleryMedia,
} from "@shared/schema";
import { db } from "./db";
import { randomUUID } from "crypto";
import { eq, and, desc, sql } from "drizzle-orm";

// Helper to check if database is available
function checkDb() {
  if (!db) {
    throw new Error("Database not initialized. Please configure DATABASE_URL in .env file.");
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value === null || value === undefined) return 0;
  if (typeof value === "bigint") return Number(value);
  return Number(value);
}

function normalizeAmount(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error("Invalid monetary value");
  }
  return Math.round(value * 100) / 100;
}

function normalizeTrashRecordAmounts(record: TrashRecord): TrashRecord {
  return {
    ...record,
    weightKg: toNumber(record.weightKg),
    committedPayout: normalizeAmount(toNumber(record.committedPayout ?? 0)),
    vendorPayout: normalizeAmount(toNumber(record.vendorPayout ?? 0)),
  } as TrashRecord;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(id: string, username: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: "collector" | "vendor" | "factory" | "admin"): Promise<User>;
  updateUserProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    location?: string;
  }): Promise<User>;
  getVendorProfile(userId: string): Promise<VendorProfile | undefined>;
  upsertVendorProfile(userId: string, data: Omit<InsertVendorProfile, "userId">): Promise<VendorProfile>;
  listVendors(): Promise<Array<{ user: User; profile: VendorProfile }>>;
  
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
  addCoins(
    userId: string,
    amount: number,
    description: string,
    options?: {
      taskId?: string;
      reference?: string;
      trashRecordId?: string;
      type?: Transaction["type"];
    },
  ): Promise<Transaction>;
  deductCoins(
    userId: string,
    amount: number,
    description: string,
    options?: {
      reference?: string;
      trashRecordId?: string;
      type?: Transaction["type"];
    },
  ): Promise<Transaction>;
  adminDisbursePayout(actorId: string, payload: {
    targetUserId: string;
    amount: number;
    description: string;
    reference: string;
    trashRecordId?: string;
    transactionType?: "earn" | "bonus";
  }): Promise<Transaction>;
  collectorWithdraw(userId: string, reference: string): Promise<Transaction>;
  purchaseService(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Transaction>;
  transferCoins(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string,
    options?: { reference?: string; metadata?: Record<string, unknown> },
  ): Promise<{ debit: Transaction; credit: Transaction }>;
  
  // Transaction operations
  getTransactions(userId: string): Promise<Transaction[]>;

  // Trash flow operations
  createTrashRecord(record: InsertTrashRecord): Promise<TrashRecord>;
  getTrashRecord(id: string): Promise<TrashRecord | undefined>;
  listTrashRecords(filters?: {
    status?: string;
    collectorId?: string;
    vendorId?: string;
    factoryId?: string;
    reference?: string;
  }): Promise<TrashRecord[]>;
  updateTrashRecordStatus(recordId: string, status: TrashRecord["status"], options?: {
    committedPayout?: number;
    vendorPayout?: number;
    metadata?: Record<string, unknown>;
  }): Promise<TrashRecord>;
  
  // Stats
  getUserStats(userId: string): Promise<{
    tasksCompleted: number;
    totalEarnings: number;
    balance: number;
  }>;

  // Support tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(ticketId: string): Promise<SupportTicket | undefined>;
  addSupportTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;
  listSupportTickets(filters?: {
    status?: string;
    creatorId?: string;
    assigneeId?: string;
  }): Promise<SupportTicket[]>;
  updateSupportTicketStatus(ticketId: string, status: SupportTicket["status"], assigneeId?: string): Promise<SupportTicket>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    checkDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    checkDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(id: string, username: string): Promise<User> {
    checkDb();
    const [user] = await db
      .insert(users)
      .values({
        id,
        username,
        role: null,
      })
      .returning();
    return user;
  }

  async createUserWithPassword(id: string, username: string, passwordHash: string): Promise<User> {
    checkDb();
    const [user] = await db
      .insert(users)
      .values({
        id,
        username,
        passwordHash,
        role: null,
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    checkDb();
    const [user] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Ensure id and username are present
    if (!userData.id || !userData.username) {
      throw new Error("id and username are required for upsert");
    }
    
    const [user] = await db
      .insert(users)
      .values(userData as any)
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

  async updateUserRole(userId: string, role: "collector" | "vendor" | "factory" | "admin"): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    location?: string;
    profileImageUrl?: string;
    bio?: string;
    dateOfBirth?: number | Date;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    idType?: string;
    idNumber?: string;
  }): Promise<User> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.profileImageUrl !== undefined) updateData.profileImageUrl = data.profileImageUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth instanceof Date ? data.dateOfBirth.getTime() : data.dateOfBirth;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.idType !== undefined) updateData.idType = data.idType;
    if (data.idNumber !== undefined) updateData.idNumber = data.idNumber;

    const [user] = await db
      .update(users)
      .set(updateData as any)
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async getVendorProfile(userId: string): Promise<VendorProfile | undefined> {
    const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId));
    return profile as VendorProfile | undefined;
  }

  async upsertVendorProfile(userId: string, data: Omit<InsertVendorProfile, "userId">): Promise<VendorProfile> {
    const existing = await this.getVendorProfile(userId);

    if (existing) {
      const [updated] = await db
        .update(vendorProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.userId, userId))
        .returning();
      return updated as VendorProfile;
    }

    const [created] = await db
      .insert(vendorProfiles)
      .values({
        id: randomUUID(),
        userId,
        ...data,
      })
      .returning();
    return created as VendorProfile;
  }

  async listVendors(): Promise<Array<{ user: User; profile: VendorProfile }>> {
    const rows = await db
      .select({ user: users, profile: vendorProfiles })
      .from(users)
      .innerJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
      .where(eq(users.role, "vendor" as any))
      .orderBy(desc(vendorProfiles.createdAt));

    return rows.map((row: any) => ({
      user: row.user as User,
      profile: row.profile as VendorProfile,
    }));
  }

  // Factory operations
  async createFactory(factory: InsertFactory): Promise<Factory> {
    const [newFactory] = await db
      .insert(factories)
      .values({
        ...(factory as any),
        id: (factory as any).id ?? randomUUID(),
      })
      .returning();
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
      .values({
        ...(task as any),
        id: (task as any).id ?? randomUUID(),
        verificationCode,
      })
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
        { taskId }
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
    
    if (existing) {
      return { ...existing, balance: toNumber(existing.balance) } as Wallet;
    }
    
    const [wallet] = await db
      .insert(wallets)
      .values({ id: randomUUID(), userId, balance: 0 })
      .returning();
    return { ...wallet, balance: toNumber(wallet.balance) } as Wallet;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  async addCoins(
    userId: string,
    amount: number,
    description: string,
    options?: {
      taskId?: string;
      reference?: string;
      trashRecordId?: string;
      type?: Transaction["type"];
    },
  ): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const normalizedAmount = normalizeAmount(amount);
    const currentBalance = normalizeAmount(toNumber(wallet.balance));
    const updatedBalance = normalizeAmount(currentBalance + normalizedAmount);

    await db
      .update(wallets)
      .set({
        balance: updatedBalance,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId));

    const [transaction] = await db
      .insert(transactions)
      .values({
        id: randomUUID(),
        userId,
        type: options?.type ?? "earn",
        amount: normalizedAmount,
        description,
        taskId: options?.taskId,
        reference: options?.reference,
        trashRecordId: options?.trashRecordId,
      })
      .returning();

    return transaction;
  }

  async deductCoins(
    userId: string,
    amount: number,
    description: string,
    options?: {
      reference?: string;
      trashRecordId?: string;
      type?: Transaction["type"];
    },
  ): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const normalizedAmount = normalizeAmount(amount);
    const currentBalance = normalizeAmount(toNumber(wallet.balance));

    if (currentBalance < normalizedAmount) {
      throw new Error("Insufficient balance");
    }

    const updatedBalance = normalizeAmount(currentBalance - normalizedAmount);

    await db
      .update(wallets)
      .set({
        balance: updatedBalance,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId));

    const [transaction] = await db
      .insert(transactions)
      .values({
        id: randomUUID(),
        userId,
        type: options?.type ?? "redeem",
        amount: -normalizedAmount,
        description,
        reference: options?.reference,
        trashRecordId: options?.trashRecordId,
      })
      .returning();

    return transaction;
  }

  async adminDisbursePayout(
    actorId: string,
    payload: {
      targetUserId: string;
      amount: number;
      description: string;
      reference: string;
      trashRecordId?: string;
      transactionType?: Transaction["type"];
    },
  ): Promise<Transaction> {
    const amount = normalizeAmount(payload.amount);

    if (amount < 0.01) {
      throw new Error("Minimum disbursement is 0.01 KOBO");
    }

    const targetUser = await this.getUser(payload.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const transaction = await this.addCoins(payload.targetUserId, amount, payload.description, {
      reference: payload.reference,
      trashRecordId: payload.trashRecordId,
      type: payload.transactionType ?? "earn",
    });

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: actorId,
      entityType: "wallet",
      entityId: payload.targetUserId,
      action: "admin_payout",
      metadata: {
        amount,
        description: payload.description,
        reference: payload.reference,
        trashRecordId: payload.trashRecordId,
        transactionId: transaction.id,
      },
    });

    if (payload.trashRecordId) {
      const [record] = await db
        .select()
        .from(trashRecords)
        .where(eq(trashRecords.id, payload.trashRecordId));

      if (record) {
        const isCollector = targetUser.role === "collector";
        const isVendor = targetUser.role === "vendor";
        const updatePayload: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        if (isCollector) {
          const committed = normalizeAmount(amount + toNumber(record.committedPayout));
          updatePayload.committedPayout = committed;
        }

        if (isVendor) {
          const vendorTotal = normalizeAmount(amount + toNumber(record.vendorPayout));
          updatePayload.vendorPayout = vendorTotal;
        }

        if (isCollector || isVendor) {
          await db
            .update(trashRecords)
            .set(updatePayload)
            .where(eq(trashRecords.id, payload.trashRecordId));
        }
      }
    }

    return transaction;
  }

  async collectorWithdraw(userId: string, reference: string): Promise<Transaction> {
    const user = await this.getUser(userId);
    if (!user || user.role !== "collector") {
      throw new Error("Only collectors can use the collector withdrawal channel");
    }

    const withdrawAmount = 1;
    const transaction = await this.deductCoins(userId, withdrawAmount, "Collector withdrawal", {
      reference,
      type: "redeem",
    });

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: userId,
      entityType: "wallet",
      entityId: userId,
      action: "collector_withdrawal",
      metadata: {
        amount: withdrawAmount,
        reference,
        transactionId: transaction.id,
      },
    });

    return transaction;
  }

  async purchaseService(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Transaction> {
    const normalized = normalizeAmount(amount);
    if (normalized <= 0) {
      throw new Error("Purchase amount must be greater than zero");
    }

    const transaction = await this.deductCoins(userId, normalized, description, {
      type: "redeem",
    });

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: userId,
      entityType: "wallet_purchase",
      entityId: transaction.id,
      action: "purchase",
      metadata: {
        description,
        amount: normalized,
        metadata,
      },
    });

    return transaction;
  }

  async transferCoins(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string,
    options?: { reference?: string; metadata?: Record<string, unknown> },
  ): Promise<{ debit: Transaction; credit: Transaction }> {
    if (fromUserId === toUserId) {
      throw new Error("Cannot transfer coins to the same account");
    }

    const normalized = normalizeAmount(amount);
    if (normalized <= 0) {
      throw new Error("Transfer amount must be greater than zero");
    }

    const debit = await this.deductCoins(fromUserId, normalized, description, {
      reference: options?.reference,
      type: "redeem",
    });

    const credit = await this.addCoins(toUserId, normalized, description, {
      reference: options?.reference,
      type: "bonus",
    });

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: fromUserId,
      entityType: "wallet_transfer",
      entityId: debit.id,
      action: "transfer_debit",
      metadata: {
        amount: normalized,
        toUserId,
        reference: options?.reference,
        metadata: options?.metadata,
      },
    });

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: toUserId,
      entityType: "wallet_transfer",
      entityId: credit.id,
      action: "transfer_credit",
      metadata: {
        amount: normalized,
        fromUserId,
        reference: options?.reference,
        metadata: options?.metadata,
      },
    });

    return { debit, credit };
  }

  async createTrashRecord(record: InsertTrashRecord): Promise<TrashRecord> {
    const reference = record.reference ?? `TR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const payload: InsertTrashRecord = {
      ...record,
      reference,
      weightKg: normalizeAmount(toNumber(record.weightKg)),
      committedPayout: normalizeAmount(toNumber(record.committedPayout ?? 0)),
      vendorPayout: normalizeAmount(toNumber(record.vendorPayout ?? 0)),
      status: (record.status as TrashRecord["status"]) ?? "pending_vendor_confirmation",
    };

  const [created] = await db.insert(trashRecords).values({ id: randomUUID(), ...payload }).returning();

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: record.collectorId,
      entityType: "trash_record",
      entityId: created.id,
      action: "create",
      metadata: {
        reference,
        weightKg: payload.weightKg,
        trashType: record.trashType,
        vendorId: record.vendorId,
      },
    });

    return normalizeTrashRecordAmounts(created as TrashRecord);
  }

  async getTrashRecord(id: string): Promise<TrashRecord | undefined> {
    const [record] = await db.select().from(trashRecords).where(eq(trashRecords.id, id));
    if (!record) return undefined;
    return normalizeTrashRecordAmounts(record as TrashRecord);
  }

  async listTrashRecords(filters?: {
    status?: string;
    collectorId?: string;
    vendorId?: string;
    factoryId?: string;
    reference?: string;
  }): Promise<TrashRecord[]> {
    const conditions = [] as any[];

    if (filters?.status) {
      conditions.push(eq(trashRecords.status, filters.status as any));
    }

    if (filters?.collectorId) {
      conditions.push(eq(trashRecords.collectorId, filters.collectorId));
    }

    if (filters?.vendorId) {
      conditions.push(eq(trashRecords.vendorId, filters.vendorId));
    }

    if (filters?.factoryId) {
      conditions.push(eq(trashRecords.factoryId, filters.factoryId));
    }

    if (filters?.reference) {
      conditions.push(eq(trashRecords.reference, filters.reference));
    }

    let query = db.select().from(trashRecords);

    if (conditions.length === 1) {
      query = query.where(conditions[0]) as any;
    } else if (conditions.length > 1) {
      query = query.where(and(...conditions)) as any;
    }

      const rows = await query.orderBy(desc(trashRecords.submittedAt));
      return (rows as TrashRecord[]).map((row) => normalizeTrashRecordAmounts(row));
  }

  async updateTrashRecordStatus(
    recordId: string,
    status: TrashRecord["status"],
    options?: {
      committedPayout?: number;
      vendorPayout?: number;
      metadata?: Record<string, unknown>;
    },
  ): Promise<TrashRecord> {
    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (options?.committedPayout !== undefined) {
      updatePayload.committedPayout = normalizeAmount(options.committedPayout);
    }

    if (options?.vendorPayout !== undefined) {
      updatePayload.vendorPayout = normalizeAmount(options.vendorPayout);
    }

    if (options?.metadata) {
      updatePayload.metadata = options.metadata;
    }

    const now = new Date();

    if (status === "vendor_confirmed") {
      updatePayload.confirmedAt = now;
    }

    if (status === "in_transit") {
      updatePayload.shippedAt = now;
    }

    if (status === "factory_received") {
      updatePayload.receivedAt = now;
    }

    if (status === "payout_released") {
      updatePayload.paidAt = now;
    }

    const [record] = await db
      .update(trashRecords)
      .set(updatePayload)
      .where(eq(trashRecords.id, recordId))
      .returning();

    if (!record) {
      throw new Error("Trash record not found");
    }

    await db.insert(auditLogs).values({
      id: randomUUID(),
      entityType: "trash_record",
      entityId: recordId,
      action: "status_update",
      metadata: {
        status,
        committedPayout: updatePayload.committedPayout,
        vendorPayout: updatePayload.vendorPayout,
      },
    });

    return normalizeTrashRecordAmounts(record as TrashRecord);
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
  const [created] = await db.insert(supportTickets).values({ id: randomUUID(), ...ticket }).returning();

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: ticket.creatorId,
      entityType: "support_ticket",
      entityId: created.id,
      action: "create",
      metadata: {
        category: ticket.category,
        subject: ticket.subject,
      },
    });

    return created as SupportTicket;
  }

  async getSupportTicket(ticketId: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));
    if (!ticket) return undefined;
    return ticket as SupportTicket;
  }

  async addSupportTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
  const [created] = await db.insert(supportTicketMessages).values({ id: randomUUID(), ...message }).returning();

    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: message.authorId,
      entityType: "support_ticket_message",
      entityId: created.id,
      action: "create",
      metadata: {
        ticketId: message.ticketId,
      },
    });

    return created as SupportTicketMessage;
  }

  async listSupportTickets(filters?: {
    status?: string;
    creatorId?: string;
    assigneeId?: string;
  }): Promise<SupportTicket[]> {
    const conditions = [] as any[];

    if (filters?.status) {
      conditions.push(eq(supportTickets.status, filters.status as any));
    }

    if (filters?.creatorId) {
      conditions.push(eq(supportTickets.creatorId, filters.creatorId));
    }

    if (filters?.assigneeId) {
      conditions.push(eq(supportTickets.assigneeId, filters.assigneeId));
    }

    let query = db.select().from(supportTickets);

    if (conditions.length === 1) {
      query = query.where(conditions[0]) as any;
    } else if (conditions.length > 1) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query.orderBy(desc(supportTickets.createdAt));
    return rows as SupportTicket[];
  }

  async updateSupportTicketStatus(
    ticketId: string,
    status: SupportTicket["status"],
    assigneeId?: string,
  ): Promise<SupportTicket> {
    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (assigneeId) {
      updatePayload.assigneeId = assigneeId;
    }

    if (status === "resolved" || status === "closed") {
      updatePayload.resolvedAt = new Date();
    }

    const [ticket] = await db
      .update(supportTickets)
      .set(updatePayload)
      .where(eq(supportTickets.id, ticketId))
      .returning();

    if (!ticket) {
      throw new Error("Support ticket not found");
    }

    await db.insert(auditLogs).values({
      id: randomUUID(),
      entityType: "support_ticket",
      entityId: ticketId,
      action: "status_update",
      metadata: {
        status,
        assigneeId,
      },
    });

    return ticket as SupportTicket;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));

      return (rows as Transaction[]).map((transaction) => ({
        ...transaction,
        amount: normalizeAmount(toNumber(transaction.amount)),
      }));
  }

  async getUserStats(userId: string): Promise<{
    tasksCompleted: number;
    totalEarnings: number;
    balance: number;
  }> {
    const completedTasks = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(tasks)
      .where(and(
        eq(tasks.collectorId, userId),
        eq(tasks.status, "verified")
      ));
    
    const earnings = await db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, "earn")
      ));
    
    const wallet = await this.getOrCreateWallet(userId);
    const totalEarnings = normalizeAmount(earnings[0]?.total ?? 0);
    
    return {
      tasksCompleted: completedTasks[0]?.count || 0,
      totalEarnings,
      balance: wallet.balance,
    };
  }

  async getStats() {
    checkDb();
    try {
      const totalKg = await db
        .select({ value: sql<number>`COALESCE(SUM(weight_kg), 0)` })
        .from(trashRecords)
        .where(eq(trashRecords.status, "payout_released"));

      const totalUsers = await db
        .select({ value: sql<number>`COUNT(*)` })
        .from(users);

      const totalJobs = await db
        .select({ value: sql<number>`COUNT(*)` })
        .from(users)
        .where(eq(users.role, "collector"));

      return {
        kgCollected: toNumber(totalKg[0]?.value || 0),
        jobsCreated: toNumber(totalJobs[0]?.value || 0),
        communityMembers: toNumber(totalUsers[0]?.value || 0),
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      throw error;
    }
  }

  async getTopCollectors(limit: number = 5) {
    checkDb();
    try {
      const topCollectors = await db
        .select({
          userId: trashRecords.collectorId,
          username: users.username,
          firstName: users.firstName,
          profileImageUrl: users.profileImageUrl,
          totalKg: sql<number>`COALESCE(SUM(weight_kg), 0)`,
        })
        .from(trashRecords)
        .leftJoin(users, eq(trashRecords.collectorId, users.id))
        .where(eq(trashRecords.status, "payout_released"))
        .groupBy(trashRecords.collectorId, users.username, users.firstName, users.profileImageUrl)
        .orderBy(desc(sql`SUM(weight_kg)`))
        .limit(limit);

      return topCollectors.map((collector, index) => ({
        rank: index + 1,
        name: collector.username || collector.firstName || "Anonymous",
        avatar: collector.profileImageUrl,
        collected: toNumber(collector.totalKg),
      }));
    } catch (error) {
      console.error("Error getting top collectors:", error);
      throw error;
    }
  }

  // ===================== EVENT GALLERY METHODS =====================

  async getEventGalleryEvents(filters?: { category?: string; featured?: boolean }): Promise<EventGalleryEvent[]> {
    checkDb();
    try {
      const conditions = [];
      if (filters?.category) {
        conditions.push(eq(eventGalleryEvents.category, filters.category));
      }
      if (filters?.featured !== undefined) {
        conditions.push(eq(eventGalleryEvents.featured, filters.featured));
      }

      if (conditions.length > 0) {
        return await db.select().from(eventGalleryEvents).where(and(...conditions)).orderBy(desc(eventGalleryEvents.date));
      }
      return await db.select().from(eventGalleryEvents).orderBy(desc(eventGalleryEvents.date));
    } catch (error) {
      console.error("Error getting event gallery events:", error);
      throw error;
    }
  }

  async getEventGalleryEventById(id: string): Promise<(EventGalleryEvent & { media: EventGalleryMedia[] }) | null> {
    checkDb();
    try {
      const event = await db.select().from(eventGalleryEvents).where(eq(eventGalleryEvents.id, id)).get();
      if (!event) return null;

      const media = await db.select().from(eventGalleryMedia).where(eq(eventGalleryMedia.eventId, id)).orderBy(eventGalleryMedia.order);

      return { ...event, media };
    } catch (error) {
      console.error("Error getting event gallery event by id:", error);
      throw error;
    }
  }

  async createEventGalleryEvent(data: InsertEventGalleryEvent): Promise<EventGalleryEvent> {
    checkDb();
    try {
      const id = randomUUID();
      const now = new Date();
      
      // Convert timestamp to Date if necessary
      const eventDate = typeof data.date === 'number' ? new Date(data.date) : data.date;
      
      const newEvent = {
        ...data,
        id,
        date: eventDate,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(eventGalleryEvents).values(newEvent);
      return await this.getEventGalleryEventById(id) as EventGalleryEvent;
    } catch (error) {
      console.error("Error creating event gallery event:", error);
      throw error;
    }
  }

  async updateEventGalleryEvent(id: string, data: Partial<InsertEventGalleryEvent>): Promise<EventGalleryEvent | null> {
    checkDb();
    try {
      const now = new Date();
      
      // Convert timestamp to Date if date is being updated
      const updateData: any = { ...data, updatedAt: now };
      if (data.date && typeof data.date === 'number') {
        updateData.date = new Date(data.date);
      }
      
      await db.update(eventGalleryEvents).set(updateData).where(eq(eventGalleryEvents.id, id));
      
      const updated = await db.select().from(eventGalleryEvents).where(eq(eventGalleryEvents.id, id)).get();
      return updated || null;
    } catch (error) {
      console.error("Error updating event gallery event:", error);
      throw error;
    }
  }

  async deleteEventGalleryEvent(id: string): Promise<boolean> {
    checkDb();
    try {
      // Delete all media first (cascade should handle this, but being explicit)
      await db.delete(eventGalleryMedia).where(eq(eventGalleryMedia.eventId, id));
      
      const result = await db.delete(eventGalleryEvents).where(eq(eventGalleryEvents.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting event gallery event:", error);
      throw error;
    }
  }

  async createEventGalleryMedia(data: Omit<InsertEventGalleryMedia, "id" | "createdAt">): Promise<EventGalleryMedia> {
    checkDb();
    try {
      const id = randomUUID();
      const now = new Date();
      
      const newMedia = {
        ...data,
        id,
        createdAt: now,
      };

      await db.insert(eventGalleryMedia).values(newMedia);
      return await this.getEventGalleryMediaById(id) as EventGalleryMedia;
    } catch (error) {
      console.error("Error creating event gallery media:", error);
      throw error;
    }
  }

  async getEventGalleryMediaByEventId(eventId: string): Promise<EventGalleryMedia[]> {
    checkDb();
    try {
      return await db.select().from(eventGalleryMedia).where(eq(eventGalleryMedia.eventId, eventId)).orderBy(eventGalleryMedia.order);
    } catch (error) {
      console.error("Error getting event gallery media:", error);
      throw error;
    }
  }

  async getEventGalleryMediaById(id: string): Promise<EventGalleryMedia | null> {
    checkDb();
    try {
      const media = await db.select().from(eventGalleryMedia).where(eq(eventGalleryMedia.id, id)).get();
      return media || null;
    } catch (error) {
      console.error("Error getting event gallery media by id:", error);
      throw error;
    }
  }

  async deleteEventGalleryMedia(id: string): Promise<boolean> {
    checkDb();
    try {
      await db.delete(eventGalleryMedia).where(eq(eventGalleryMedia.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting event gallery media:", error);
      throw error;
    }
  }

  // ===================== END EVENT GALLERY METHODS =====================
}

export const storage = new DatabaseStorage();
