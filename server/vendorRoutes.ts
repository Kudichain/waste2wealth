import type { Express, Request, Response } from "express";
import { db } from "./db";
import { users, transactionTokens } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  generateTransactionToken, 
  addAuditEntry, 
  calculatePayment,
  verifyTransactionIntegrity 
} from "./transactionTokens";

// Extend Express session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

export function registerVendorRoutes(app: Express) {
  
  // ==================== VENDOR AUTHENTICATION ROUTES ====================
  
  /**
   * POST /api/vendor/authenticate-drop
   * Vendor scans collector's barcode and creates transaction token
   */
  app.post("/api/vendor/authenticate-drop", async (req: Request, res: Response) => {
    try {
      // Check authentication
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify vendor role
      const [vendor] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId));

      if (!vendor || vendor.role !== "vendor") {
        return res.status(403).json({ message: "Vendor access required" });
      }

      const { collectorBarcodeId, trashType, weight, notes } = req.body;

      // Validate required fields
      if (!collectorBarcodeId || !trashType || !weight) {
        return res.status(400).json({ 
          message: "Missing required fields: collectorBarcodeId, trashType, weight" 
        });
      }

      // Verify collector exists and has barcode
      const [collector] = await db
        .select()
        .from(users)
        .where(eq(users.barcodeId, collectorBarcodeId));

      if (!collector) {
        return res.status(404).json({ message: "Collector not found with this barcode" });
      }

      if (collector.role !== "collector") {
        return res.status(400).json({ message: "Invalid barcode - not a collector" });
      }

      // Generate unique transaction token
      const token = generateTransactionToken(trashType);
      const amount = await calculatePayment(trashType, weight);

      // Create audit trail entry
      const auditTrail = addAuditEntry(
        [],
        "authenticated",
        req.session.userId,
        { action: "Vendor authenticated waste drop", trashType, weight, amount }
      );

      // Insert transaction token
      const [transactionToken] = await db
        .insert(transactionTokens)
        .values({
          id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          token,
          collectorId: collector.id,
          vendorId: req.session.userId,
          barcodeId: collectorBarcodeId,
          trashType,
          weight,
          amount,
          status: "authenticated",
          authenticatedAt: new Date(),
          vendorNotes: notes || null,
          auditTrail: JSON.stringify(auditTrail),
          isValid: true,
        })
        .returning();

      res.json({
        success: true,
        token: transactionToken.token,
        transaction: {
          ...transactionToken,
          collectorName: collector.username,
          collectorFirstName: collector.firstName,
          collectorLastName: collector.lastName,
        },
        message: "Transaction authenticated successfully",
      });

    } catch (error) {
      console.error("Error authenticating drop:", error);
      res.status(500).json({ message: "Failed to authenticate transaction" });
    }
  });

  /**
   * GET /api/vendor/incoming-drops
   * Get list of authenticated transactions pending transfer
   */
  app.get("/api/vendor/incoming-drops", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const transactions = await db
        .select({
          id: transactionTokens.id,
          token: transactionTokens.token,
          collectorId: transactionTokens.collectorId,
          collectorUsername: users.username,
          collectorFirstName: users.firstName,
          collectorLastName: users.lastName,
          barcodeId: transactionTokens.barcodeId,
          trashType: transactionTokens.trashType,
          weight: transactionTokens.weight,
          amount: transactionTokens.amount,
          status: transactionTokens.status,
          authenticatedAt: transactionTokens.authenticatedAt,
          vendorNotes: transactionTokens.vendorNotes,
          createdAt: transactionTokens.createdAt,
        })
        .from(transactionTokens)
        .leftJoin(users, eq(transactionTokens.collectorId, users.id))
        .where(
          and(
            eq(transactionTokens.vendorId, req.session.userId),
            eq(transactionTokens.status, "authenticated")
          )
        )
        .orderBy(desc(transactionTokens.createdAt));

      res.json(transactions);

    } catch (error) {
      console.error("Error fetching incoming drops:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  /**
   * POST /api/vendor/transfer-to-factory
   * Vendor marks transaction as transferred to factory
   */
  app.post("/api/vendor/transfer-to-factory", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { transactionId, factoryId, notes } = req.body;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID required" });
      }

      // Get current transaction
      const [transaction] = await db
        .select()
        .from(transactionTokens)
        .where(eq(transactionTokens.id, transactionId));

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Verify vendor owns this transaction
      if (transaction.vendorId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized - not your transaction" });
      }

      // Verify status is authenticated
      if (transaction.status !== "authenticated") {
        return res.status(400).json({ 
          message: `Cannot transfer - current status is ${transaction.status}` 
        });
      }

      // Update audit trail
      const auditTrailData = transaction.auditTrail as any;
      const currentAuditTrail = typeof auditTrailData === 'string' 
        ? JSON.parse(auditTrailData) 
        : (Array.isArray(auditTrailData) ? auditTrailData : []);
      const newAuditTrail = addAuditEntry(
        currentAuditTrail,
        "transferred_to_factory",
        req.session.userId,
        { factoryId, notes }
      );

      // Update transaction
      const [updated] = await db
        .update(transactionTokens)
        .set({
          status: "transferred_to_factory",
          transferredAt: new Date(),
          factoryId: factoryId || null,
          vendorNotes: notes || transaction.vendorNotes,
          auditTrail: JSON.stringify(newAuditTrail),
          updatedAt: new Date(),
        })
        .where(eq(transactionTokens.id, transactionId))
        .returning();

      res.json({
        success: true,
        transaction: updated,
        message: "Transaction transferred to factory successfully",
      });

    } catch (error) {
      console.error("Error transferring to factory:", error);
      res.status(500).json({ message: "Failed to transfer transaction" });
    }
  });

  /**
   * GET /api/vendor/transfer-history
   * Get all transferred transactions for this vendor
   */
  app.get("/api/vendor/transfer-history", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const transactions = await db
        .select()
        .from(transactionTokens)
        .where(
          and(
            eq(transactionTokens.vendorId, req.session.userId),
            sql`${transactionTokens.status} IN ('transferred_to_factory', 'payment_approved', 'payment_released')`
          )
        )
        .orderBy(desc(transactionTokens.transferredAt));

      res.json(transactions);

    } catch (error) {
      console.error("Error fetching transfer history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  /**
   * GET /api/vendor/analytics
   * Get vendor analytics and statistics
   */
  app.get("/api/vendor/analytics", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Total authenticated waste
      const [totalStats] = await db
        .select({
          totalTransactions: sql<number>`COUNT(*)`,
          totalWeight: sql<number>`SUM(${transactionTokens.weight})`,
          totalAmount: sql<number>`SUM(${transactionTokens.amount})`,
        })
        .from(transactionTokens)
        .where(eq(transactionTokens.vendorId, req.session.userId));

      // By trash type
      const byType = await db
        .select({
          trashType: transactionTokens.trashType,
          count: sql<number>`COUNT(*)`,
          totalWeight: sql<number>`SUM(${transactionTokens.weight})`,
          totalAmount: sql<number>`SUM(${transactionTokens.amount})`,
        })
        .from(transactionTokens)
        .where(eq(transactionTokens.vendorId, req.session.userId))
        .groupBy(transactionTokens.trashType);

      // By status
      const byStatus = await db
        .select({
          status: transactionTokens.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(transactionTokens)
        .where(eq(transactionTokens.vendorId, req.session.userId))
        .groupBy(transactionTokens.status);

      // Top collectors
      const topCollectors = await db
        .select({
          collectorId: transactionTokens.collectorId,
          collectorUsername: users.username,
          transactionCount: sql<number>`COUNT(*)`,
          totalWeight: sql<number>`SUM(${transactionTokens.weight})`,
        })
        .from(transactionTokens)
        .leftJoin(users, eq(transactionTokens.collectorId, users.id))
        .where(eq(transactionTokens.vendorId, req.session.userId))
        .groupBy(transactionTokens.collectorId, users.username)
        .orderBy(desc(sql`SUM(${transactionTokens.weight})`))
        .limit(10);

      res.json({
        overview: totalStats,
        byTrashType: byType,
        byStatus: byStatus,
        topCollectors: topCollectors,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  /**
   * GET /api/vendor/verify-barcode/:barcodeId
   * Verify a collector's barcode before authentication
   */
  app.get("/api/vendor/verify-barcode/:barcodeId", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { barcodeId } = req.params;

      const [collector] = await db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          photoUrl: users.photoUrl,
          kycStatus: users.kycStatus,
          barcodeId: users.barcodeId,
          profileCompletionPercentage: users.profileCompletionPercentage,
        })
        .from(users)
        .where(eq(users.barcodeId, barcodeId));

      if (!collector) {
        return res.status(404).json({ 
          valid: false,
          message: "Barcode not found" 
        });
      }

      if (collector.kycStatus !== "verified" && collector.kycStatus !== "approved") {
        return res.json({
          valid: true,
          verified: false,
          collector,
          warning: "Collector KYC not verified - proceed with caution",
        });
      }

      res.json({
        valid: true,
        verified: true,
        collector,
      });

    } catch (error) {
      console.error("Error verifying barcode:", error);
      res.status(500).json({ message: "Failed to verify barcode" });
    }
  });
}
