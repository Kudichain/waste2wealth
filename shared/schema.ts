import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums (using text fields for SQLite)
const userRoleEnum = ["collector", "vendor", "factory", "admin"] as const;
const trashTypeEnum = ["plastic", "metal", "organic"] as const;
const taskStatusEnum = ["available", "accepted", "in_progress", "completed", "verified", "cancelled"] as const;
const transactionTypeEnum = ["earn", "redeem", "bonus", "penalty"] as const;
const trashStatusEnum = [
  "pending_vendor_confirmation",
  "vendor_confirmed",
  "in_transit",
  "factory_received",
  "payout_released",
  "cancelled",
] as const;
const supportTicketCategoryEnum = [
  "wallet",
  "trash_drop",
  "vendor_issue",
  "factory_issue",
  "other",
] as const;
const supportTicketStatusEnum = ["open", "in_progress", "resolved", "closed"] as const;

// Session storage table (for express-session)
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  // store session as JSON text
  sess: text("sess", { mode: "json" }).notNull(),
  expire: integer("expire", { mode: "timestamp" }).notNull(),
});

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash"), // Hashed password for authentication
  firstName: text("first_name"),
  lastName: text("last_name"),
  verifiedFullName: text("verified_full_name"), // from NIN/Voter card
  profileImageUrl: text("profile_image_url"),
  photoUrl: text("photo_url"), // Profile photo for visual identification
  bio: text("bio"),
  dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
  gender: text("gender"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  serviceArea: text("service_area"), // For collectors
  idType: text("id_type"), // national_id, drivers_license, passport, voters_card
  idNumber: text("id_number"),
  idVerified: integer("id_verified", { mode: "boolean" }).default(false),
  kycStatus: text("kyc_status").default("pending"), // pending, verified, approved, rejected
  barcodeId: text("barcode_id").unique(), // Unique barcode for collector identification
  role: text("role", { enum: userRoleEnum }),
  phoneNumber: text("phone_number"),
  location: text("location"),
  verified: integer("verified", { mode: "boolean" }).default(false),
  profileCompletionPercentage: integer("profile_completion_percentage").default(0),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const vendorProfiles = sqliteTable("vendor_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  businessName: text("business_name").notNull(),
  businessLogo: text("business_logo"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  state: text("state").notNull(),
  lga: text("lga").notNull(),
  ward: text("ward"),
  businessRegistrationNumber: text("business_registration_number"),
  businessCertificate: text("business_certificate"), // file path/url
  taxId: text("tax_id"),
  yearsInBusiness: integer("years_in_business"),
  services: text("services", { mode: "json" }),
  description: text("description"), // business bio/description
  operatingHours: text("operating_hours", { mode: "json" }),
  bankName: text("bank_name"),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  bankCode: text("bank_code"),
  verified: integer("verified", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Factories table
export const factories = sqliteTable("factories", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  acceptedTrashTypes: text("accepted_trash_types", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  verified: integer("verified", { mode: "boolean" }).default(false),
  phoneNumber: text("phone_number"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Tasks table
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id").notNull().references(() => factories.id),
  type: text("type", { enum: trashTypeEnum }).notNull(),
  weight: integer("weight").notNull(),
  reward: integer("reward").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  status: text("status", { enum: taskStatusEnum }).notNull().default("available"),
  description: text("description"),
  collectorId: text("collector_id").references(() => users.id),
  acceptedAt: integer("accepted_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  verificationCode: text("verification_code"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const trashRecords = sqliteTable("trash_records", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  collectorId: text("collector_id").notNull().references(() => users.id),
  vendorId: text("vendor_id").notNull().references(() => users.id),
  factoryId: text("factory_id").references(() => factories.id),
  trashType: text("trash_type", { enum: trashTypeEnum }).notNull(),
  weightKg: real("weight_kg").$type<number>().notNull(),
  qualityNotes: text("quality_notes"),
  status: text("status", { enum: trashStatusEnum }).notNull().default("pending_vendor_confirmation"),
  committedPayout: real("committed_payout").$type<number>().default(0),
  vendorPayout: real("vendor_payout").$type<number>().default(0),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
  shippedAt: integer("shipped_at", { mode: "timestamp" }),
  receivedAt: integer("received_at", { mode: "timestamp" }),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Transactions table (wallet history)
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type", { enum: transactionTypeEnum }).notNull(),
  amount: real("amount").$type<number>().notNull(),
  description: text("description"),
  reference: text("reference"),
  taskId: text("task_id").references(() => tasks.id),
  trashRecordId: text("trash_record_id").references(() => trashRecords.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// User wallet balances
export const wallets = sqliteTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  balance: real("balance").$type<number>().notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").notNull().references(() => users.id),
  assigneeId: text("assignee_id").references(() => users.id),
  category: text("category", { enum: supportTicketCategoryEnum }).notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  status: text("status", { enum: supportTicketStatusEnum }).notNull().default("open"),
  priority: integer("priority").default(2),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

export const supportTicketMessages = sqliteTable("support_ticket_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().references(() => supportTickets.id),
  authorId: text("author_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachments: text("attachments", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Blog posts table
export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  published: integer("published", { mode: "boolean" }).default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Bank Accounts table
export const bankAccounts = sqliteTable("bank_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  bankName: text("bank_name").notNull(),
  bankCode: text("bank_code").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  verified: integer("verified", { mode: "boolean" }).default(false),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Payment Statements table (detailed transaction records)
export const paymentStatements = sqliteTable("payment_statements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  transactionId: text("transaction_id").references(() => transactions.id),
  type: text("type").notNull(), // payment, receipt, withdrawal, refund
  amount: real("amount").$type<number>().notNull(),
  balanceBefore: real("balance_before").$type<number>().notNull(),
  balanceAfter: real("balance_after").$type<number>().notNull(),
  description: text("description").notNull(),
  reference: text("reference").notNull().unique(),
  status: text("status").notNull().default("completed"), // pending, completed, failed, reversed
  paymentMethod: text("payment_method"), // wallet, bank_transfer, cash
  bankAccountId: text("bank_account_id").references(() => bankAccounts.id),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// ID Verification table (stores extracted info from NIN/Voter cards)
export const idVerifications = sqliteTable("id_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  idType: text("id_type").notNull(), // nin, voters_card, drivers_license, passport
  idNumber: text("id_number").notNull(),
  fullName: text("full_name").notNull(), // extracted from ID
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  state: text("state"),
  idImageUrl: text("id_image_url"), // path to uploaded ID image
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, rejected
  verifiedBy: text("verified_by").references(() => users.id), // admin who verified
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  rejectionReason: text("rejection_reason"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Chat Support table (AI chatbot and human support)
export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  sessionType: text("session_type").notNull().default("bot"), // bot, human, escalated
  status: text("status").notNull().default("active"), // active, resolved, closed
  assignedAgentId: text("assigned_agent_id").references(() => users.id),
  startedAt: integer("started_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  metadata: text("metadata", { mode: "json" }),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSessions.id),
  senderId: text("sender_id").references(() => users.id), // null for bot messages
  senderType: text("sender_type").notNull(), // user, bot, agent
  message: text("message").notNull(),
  metadata: text("metadata", { mode: "json" }), // for attachments, bot confidence, etc.
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Barcode Drops table (for tracking trash drops via barcode scan)
export const barcodeDrops = sqliteTable("barcode_drops", {
  id: text("id").primaryKey(),
  collectorId: text("collector_id").notNull().references(() => users.id),
  vendorId: text("vendor_id").notNull().references(() => users.id),
  barcodeId: text("barcode_id").notNull(), // Scanned barcode
  trashType: text("trash_type", { enum: trashTypeEnum }).notNull(),
  weight: real("weight").$type<number>().notNull(), // in kg
  amount: real("amount").$type<number>().notNull(), // payment amount
  status: text("status").notNull().default("pending"), // pending, confirmed, paid, disputed
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  transactionId: text("transaction_id").references(() => transactions.id),
  metadata: text("metadata", { mode: "json" }), // photos, notes, etc.
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Transaction Tokens table (immutable secure tokens for waste transactions)
export const transactionTokens = sqliteTable("transaction_tokens", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(), // Format: TRX-YYYY-TYPE-XXXXX
  collectorId: text("collector_id").notNull().references(() => users.id),
  vendorId: text("vendor_id").notNull().references(() => users.id),
  factoryId: text("factory_id").references(() => users.id),
  barcodeId: text("barcode_id").notNull(),
  trashType: text("trash_type", { enum: trashTypeEnum }).notNull(),
  weight: real("weight").$type<number>().notNull(), // in kg
  amount: real("amount").$type<number>().notNull(), // calculated payment
  
  // Transaction flow status
  status: text("status").notNull().default("pending_authentication"), 
  // Statuses: pending_authentication, authenticated, transferred_to_factory, payment_approved, payment_released, disputed, cancelled
  
  // Timestamps for audit trail
  authenticatedAt: integer("authenticated_at", { mode: "timestamp" }),
  transferredAt: integer("transferred_at", { mode: "timestamp" }),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  
  // Admin oversight
  approvedBy: text("approved_by").references(() => users.id), // Admin who approved payment
  
  // Fraud prevention
  isValid: integer("is_valid", { mode: "boolean" }).default(true),
  flaggedReason: text("flagged_reason"), // If system detects fraud
  
  // Immutable audit trail (JSON array of all status changes)
  auditTrail: text("audit_trail", { mode: "json" }).notNull().default("[]"),
  
  // Transaction notes
  vendorNotes: text("vendor_notes"),
  adminNotes: text("admin_notes"),
  
  metadata: text("metadata", { mode: "json" }), // Photos, additional data
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Payment Rates table (admin-editable pricing for waste materials)
export const paymentRates = sqliteTable("payment_rates", {
  id: text("id").primaryKey(),
  trashType: text("trash_type", { enum: trashTypeEnum }).notNull().unique(),
  ratePerKg: real("rate_per_kg").$type<number>().notNull(), // Rate in Naira per kilogram
  ratePerTon: real("rate_per_ton").$type<number>().notNull(), // Rate in Naira per ton (for factories)
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  updatedBy: text("updated_by").references(() => users.id), // Admin who last updated
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Factory Subscriptions table
export const factorySubscriptions = sqliteTable("factory_subscriptions", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id").notNull().references(() => users.id),
  packageType: text("package_type").notNull(), // monthly, annual
  status: text("status").notNull().default("pending"), // pending, active, expired, cancelled
  amount: real("amount").$type<number>().notNull(),
  startDate: integer("start_date", { mode: "timestamp" }),
  expiryDate: integer("expiry_date", { mode: "timestamp" }),
  autoRenew: integer("auto_renew", { mode: "boolean" }).default(false),
  paymentMethod: text("payment_method"), // bank_transfer, card, mobile_money
  paymentReference: text("payment_reference"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  approvedBy: text("approved_by").references(() => users.id), // Admin who approved
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const insertFactorySubscriptionSchema = createInsertSchema(factorySubscriptions);

// Factory Shipments table (when factories verify waste received)
export const factoryShipments = sqliteTable("factory_shipments", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id").notNull().references(() => users.id),
  transactionTokenId: text("transaction_token_id").notNull().references(() => transactionTokens.id),
  token: text("token").notNull(), // Copy of transaction token for quick lookup
  vendorId: text("vendor_id").notNull().references(() => users.id),
  collectorId: text("collector_id").notNull().references(() => users.id),
  trashType: text("trash_type", { enum: trashTypeEnum }).notNull(),
  weight: real("weight").$type<number>().notNull(), // in kg
  weightInTons: real("weight_in_tons").$type<number>().notNull(), // calculated from weight
  pricePerTon: real("price_per_ton").$type<number>().notNull(), // Price at time of shipment
  totalAmount: real("total_amount").$type<number>().notNull(), // Total factory pays company
  status: text("status").notNull().default("pending_verification"), 
  // pending_verification, verified, payment_pending, payment_completed
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  verifiedBy: text("verified_by").references(() => users.id), // Factory user who verified
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, partial, paid
  paidAmount: real("paid_amount").$type<number>().default(0),
  paymentReference: text("payment_reference"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  factoryNotes: text("factory_notes"),
  adminNotes: text("admin_notes"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  factories: many(factories),
  tasks: many(tasks),
  transactions: many(transactions),
  collectedTrash: many(trashRecords, {
    relationName: "collector",
  }),
  vendorTrash: many(trashRecords, {
    relationName: "vendor",
  }),
  supportTickets: many(supportTickets, {
    relationName: "creator",
  }),
  assignedTickets: many(supportTickets, {
    relationName: "assignee",
  }),
  ticketMessages: many(supportTicketMessages),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  vendorProfile: one(vendorProfiles, {
    fields: [users.id],
    references: [vendorProfiles.userId],
  }),
  blogPosts: many(blogPosts),
  bankAccount: one(bankAccounts, {
    fields: [users.id],
    references: [bankAccounts.userId],
  }),
  paymentStatements: many(paymentStatements),
  idVerification: one(idVerifications, {
    fields: [users.id],
    references: [idVerifications.userId],
  }),
  chatSessions: many(chatSessions),
  collectorDrops: many(barcodeDrops, {
    relationName: "collector",
  }),
  vendorDrops: many(barcodeDrops, {
    relationName: "vendor",
  }),
}));

export const factoriesRelations = relations(factories, ({ one, many }) => ({
  owner: one(users, {
    fields: [factories.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  factory: one(factories, {
    fields: [tasks.factoryId],
    references: [factories.id],
  }),
  collector: one(users, {
    fields: [tasks.collectorId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [transactions.taskId],
    references: [tasks.id],
  }),
  trashRecord: one(trashRecords, {
    fields: [transactions.trashRecordId],
    references: [trashRecords.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const trashRecordsRelations = relations(trashRecords, ({ one, many }) => ({
  collector: one(users, {
    relationName: "collector",
    fields: [trashRecords.collectorId],
    references: [users.id],
  }),
  vendor: one(users, {
    relationName: "vendor",
    fields: [trashRecords.vendorId],
    references: [users.id],
  }),
  factory: one(factories, {
    fields: [trashRecords.factoryId],
    references: [factories.id],
  }),
  transactions: many(transactions),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  creator: one(users, {
    relationName: "creator",
    fields: [supportTickets.creatorId],
    references: [users.id],
  }),
  assignee: one(users, {
    relationName: "assignee",
    fields: [supportTickets.assigneeId],
    references: [users.id],
  }),
  messages: many(supportTicketMessages),
}));

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [supportTickets.id],
  }),
  author: one(users, {
    fields: [supportTicketMessages.authorId],
    references: [users.id],
  }),
}));

export const vendorProfilesRelations = relations(vendorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [bankAccounts.userId],
    references: [users.id],
  }),
  paymentStatements: many(paymentStatements),
}));

export const paymentStatementsRelations = relations(paymentStatements, ({ one }) => ({
  user: one(users, {
    fields: [paymentStatements.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [paymentStatements.transactionId],
    references: [transactions.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [paymentStatements.bankAccountId],
    references: [bankAccounts.id],
  }),
}));

export const idVerificationsRelations = relations(idVerifications, ({ one }) => ({
  user: one(users, {
    fields: [idVerifications.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [idVerifications.verifiedBy],
    references: [users.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  assignedAgent: one(users, {
    fields: [chatSessions.assignedAgentId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const barcodeDropsRelations = relations(barcodeDrops, ({ one }) => ({
  collector: one(users, {
    fields: [barcodeDrops.collectorId],
    references: [users.id],
    relationName: "collector",
  }),
  vendor: one(users, {
    fields: [barcodeDrops.vendorId],
    references: [users.id],
    relationName: "vendor",
  }),
  transaction: one(transactions, {
    fields: [barcodeDrops.transactionId],
    references: [transactions.id],
  }),
}));

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users);

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  bio: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  idType: true,
  idNumber: true,
}).partial();

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
});

// Zod schemas for validation (types for inserts will rely on Drizzle's $inferInsert for accuracy)
export const insertFactorySchema = createInsertSchema(factories, {
  acceptedTrashTypes: z.array(z.string()),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertTrashRecordSchema = createInsertSchema(trashRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  confirmedAt: true,
  shippedAt: true,
  receivedAt: true,
  paidAt: true,
  submittedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVendorProfileSchema = z.object({
  businessName: z.string().optional(),
  businessLogo: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  businessCertificate: z.string().optional(),
  taxId: z.string().optional(),
  yearsInBusiness: z.number().optional(),
  services: z.array(z.string()).optional(),
  description: z.string().max(1000).optional(),
  operatingHours: z.record(z.string()).optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankCode: z.string().optional(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentStatementSchema = createInsertSchema(paymentStatements).omit({
  id: true,
  createdAt: true,
});

export const insertIdVerificationSchema = createInsertSchema(idVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertBarcodeDropSchema = createInsertSchema(barcodeDrops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===================== REFERRAL SYSTEM =====================

// Referral status enum
const referralStatusEnum = ["pending", "completed", "rewarded"] as const;

// Referrals table - tracks who invited whom
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referrerId: text("referrer_id").notNull().references(() => users.id), // User who sent the invite
  refereeId: text("referee_id").references(() => users.id), // User who was invited (null until they sign up)
  referralCode: text("referral_code").notNull().unique(), // Unique code for each referrer
  status: text("status", { enum: referralStatusEnum }).notNull().default("pending"),
  signupDate: integer("signup_date", { mode: "timestamp" }), // When referee signed up
  firstCollectionDate: integer("first_collection_date", { mode: "timestamp" }), // When referee completed first collection
  rewardAmount: integer("reward_amount").notNull().default(100000), // KOBO amount (100 KOBO = 100,000 milliKOBO)
  rewardPaid: integer("reward_paid", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Referral milestones - bonus rewards for achieving certain referral counts
export const referralMilestones = sqliteTable("referral_milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  milestone: integer("milestone").notNull(), // e.g., 5, 10, 25, 50 referrals
  bonusAmount: integer("bonus_amount").notNull(), // KOBO bonus for reaching milestone
  achievedAt: integer("achieved_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  paid: integer("paid", { mode: "boolean" }).notNull().default(false),
});

// Referral stats cache - for quick dashboard lookups
export const referralStats = sqliteTable("referral_stats", {
  userId: text("user_id").primaryKey().references(() => users.id),
  referralCode: text("referral_code").notNull().unique(),
  totalReferrals: integer("total_referrals").notNull().default(0),
  completedReferrals: integer("completed_referrals").notNull().default(0), // Those who completed first collection
  totalEarnings: integer("total_earnings").notNull().default(0), // Total KOBO earned from referrals
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referee: one(users, {
    fields: [referrals.refereeId],
    references: [users.id],
    relationName: "referee",
  }),
}));

export const referralMilestonesRelations = relations(referralMilestones, ({ one }) => ({
  user: one(users, {
    fields: [referralMilestones.userId],
    references: [users.id],
  }),
}));

export const referralStatsRelations = relations(referralStats, ({ one }) => ({
  user: one(users, {
    fields: [referralStats.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertReferralSchema = createInsertSchema(referrals, {
  rewardAmount: z.number().int().positive().default(100000),
});

export const insertReferralMilestoneSchema = createInsertSchema(referralMilestones, {
  milestone: z.number().int().positive(),
  bonusAmount: z.number().int().positive(),
});

export const insertReferralStatSchema = createInsertSchema(referralStats);

// ===================== END REFERRAL SYSTEM =====================

// ===================== EVENT GALLERY SYSTEM =====================

// Event Gallery Events table
export const eventGalleryEvents = sqliteTable("event_gallery_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  location: text("location").notNull(),
  participants: integer("participants").default(0),
  wasteCollected: text("waste_collected"), // e.g., "12 tons", "N/A"
  category: text("category").notNull(), // cleanup, workshop, university, factory, training, celebration
  featured: integer("featured", { mode: "boolean" }).default(false),
  description: text("description"),
  highlights: text("highlights", { mode: "json" }), // Array of highlight strings
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Event Gallery Media (photos and videos)
export const eventGalleryMedia = sqliteTable("event_gallery_media", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => eventGalleryEvents.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // photo, video
  url: text("url").notNull(), // Storage path/URL
  thumbnailUrl: text("thumbnail_url"), // For videos
  caption: text("caption"),
  duration: text("duration"), // For videos, e.g., "3:45"
  order: integer("order").default(0), // Display order
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Relations
export const eventGalleryEventsRelations = relations(eventGalleryEvents, ({ one, many }) => ({
  uploader: one(users, {
    fields: [eventGalleryEvents.uploadedBy],
    references: [users.id],
  }),
  media: many(eventGalleryMedia),
}));

export const eventGalleryMediaRelations = relations(eventGalleryMedia, ({ one }) => ({
  event: one(eventGalleryEvents, {
    fields: [eventGalleryMedia.eventId],
    references: [eventGalleryEvents.id],
  }),
  uploader: one(users, {
    fields: [eventGalleryMedia.uploadedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertEventGalleryEventSchema = createInsertSchema(eventGalleryEvents, {
  title: z.string().min(1, "Event title is required"),
  date: z.number().int().positive(),
  location: z.string().min(1, "Location is required"),
  category: z.enum(["cleanup", "workshop", "university", "factory", "training", "celebration"]),
  highlights: z.array(z.string()).optional(),
});

export const insertEventGalleryMediaSchema = createInsertSchema(eventGalleryMedia, {
  eventId: z.string().min(1, "Event ID is required"),
  type: z.enum(["photo", "video"]),
  url: z.string().url("Invalid media URL"),
});

// ===================== END EVENT GALLERY SYSTEM =====================

// Export types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Factory = typeof factories.$inferSelect;
export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type TrashRecord = typeof trashRecords.$inferSelect;
export type InsertTrashRecord = z.infer<typeof insertTrashRecordSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type UpdateVendorProfile = z.infer<typeof updateVendorProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type PaymentStatement = typeof paymentStatements.$inferSelect;
export type InsertPaymentStatement = z.infer<typeof insertPaymentStatementSchema>;
export type IdVerification = typeof idVerifications.$inferSelect;
export type InsertIdVerification = z.infer<typeof insertIdVerificationSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type BarcodeDrop = typeof barcodeDrops.$inferSelect;
export type InsertBarcodeDrop = z.infer<typeof insertBarcodeDropSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ReferralMilestone = typeof referralMilestones.$inferSelect;
export type InsertReferralMilestone = z.infer<typeof insertReferralMilestoneSchema>;
export type ReferralStat = typeof referralStats.$inferSelect;
export type InsertReferralStat = z.infer<typeof insertReferralStatSchema>;
export type EventGalleryEvent = typeof eventGalleryEvents.$inferSelect;
export type InsertEventGalleryEvent = z.infer<typeof insertEventGalleryEventSchema>;
export type EventGalleryMedia = typeof eventGalleryMedia.$inferSelect;
export type InsertEventGalleryMedia = z.infer<typeof insertEventGalleryMediaSchema>;

// Waste Rate Management
export const wasteRates = sqliteTable("waste_rates", {
  id: text("id").primaryKey(),
  wasteType: text("waste_type").notNull(), // plastic, metal, paper, organic
  ratePerTon: integer("rate_per_ton").notNull(), // in Naira
  effectiveDate: integer("effective_date", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertWasteRateSchema = createInsertSchema(wasteRates);

// Price Change History
export const priceHistory = sqliteTable("price_history", {
  id: text("id").primaryKey(),
  wasteType: text("waste_type").notNull(),
  oldRate: integer("old_rate").notNull(),
  newRate: integer("new_rate").notNull(),
  changeReason: text("change_reason").notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: integer("changed_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory);

// Factory Payment Links
const paymentLinkTypeEnum = ["subscription", "shipment"] as const;
const paymentLinkStatusEnum = ["pending", "paid", "expired", "failed"] as const;

export const factoryPaymentLinks = sqliteTable("factory_payment_links", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id").notNull(),
  type: text("type").notNull(), // subscription or shipment
  amount: integer("amount").notNull(), // in Naira
  status: text("status").notNull().default("pending"),
  paymentLink: text("payment_link").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  description: text("description").notNull(),
  batchId: text("batch_id"), // for shipment payments
  packageId: text("package_id"), // for subscription payments
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  paymentReference: text("payment_reference"), // from payment gateway
  paymentMethod: text("payment_method"), // card, bank_transfer, mobile_money
  paymentMetadata: text("payment_metadata", { mode: "json" }), // additional payment info
});

export const insertFactoryPaymentLinkSchema = createInsertSchema(factoryPaymentLinks);

// Subscription Packages
const packageDurationEnum = ["monthly", "annual"] as const;

export const subscriptionPackages = sqliteTable("subscription_packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  duration: text("duration").notNull(), // monthly or annual
  price: integer("price").notNull(),
  features: text("features", { mode: "json" }).notNull(), // array of features
  tonLimit: integer("ton_limit"), // null for unlimited
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertSubscriptionPackageSchema = createInsertSchema(subscriptionPackages);


// Payment Gateway Webhooks Log
export const paymentWebhooks = sqliteTable("payment_webhooks", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(), // paystack, flutterwave, remita
  eventType: text("event_type").notNull(),
  reference: text("reference").notNull(),
  payload: text("payload", { mode: "json" }).notNull(),
  processed: integer("processed", { mode: "boolean" }).notNull().default(false),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertPaymentWebhookSchema = createInsertSchema(paymentWebhooks);

// Email Notifications Log
export const emailNotifications = sqliteTable("email_notifications", {
  id: text("id").primaryKey(),
  recipientId: text("recipient_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(), // price_change, payment_link, payment_success, etc.
  templateData: text("template_data", { mode: "json" }),
  status: text("status").notNull().default("pending"), // pending, sent, failed
  sentAt: integer("sent_at", { mode: "timestamp" }),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertEmailNotificationSchema = createInsertSchema(emailNotifications);

// SMS Notifications Log
export const smsNotifications = sqliteTable("sms_notifications", {
  id: text("id").primaryKey(),
  recipientId: text("recipient_id").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // payment_link, payment_success, price_change, etc.
  status: text("status").notNull().default("pending"), // pending, sent, failed
  sentAt: integer("sent_at", { mode: "timestamp" }),
  error: text("error"),
  provider: text("provider"), // termii, twilio, etc.
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertSmsNotificationSchema = createInsertSchema(smsNotifications);

// Export types
export type WasteRate = typeof wasteRates.$inferSelect;
export type InsertWasteRate = z.infer<typeof insertWasteRateSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type FactoryPaymentLink = typeof factoryPaymentLinks.$inferSelect;
export type InsertFactoryPaymentLink = z.infer<typeof insertFactoryPaymentLinkSchema>;
export type SubscriptionPackage = typeof subscriptionPackages.$inferSelect;
export type InsertSubscriptionPackage = z.infer<typeof insertSubscriptionPackageSchema>;
export type FactorySubscription = typeof factorySubscriptions.$inferSelect;
export type InsertFactorySubscription = z.infer<typeof insertFactorySubscriptionSchema>;
export type PaymentWebhook = typeof paymentWebhooks.$inferSelect;
export type InsertPaymentWebhook = z.infer<typeof insertPaymentWebhookSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = z.infer<typeof insertEmailNotificationSchema>;
export type SmsNotification = typeof smsNotifications.$inferSelect;
export type InsertSmsNotification = z.infer<typeof insertSmsNotificationSchema>;
