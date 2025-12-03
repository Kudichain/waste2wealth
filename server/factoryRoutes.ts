import type { Express, Request, Response } from "express";
import { db } from "./db";
import { users, transactionTokens, factoryShipments, factorySubscriptions, paymentRates } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { addAuditEntry, getRatePerTon } from "./transactionTokens";

// Extend Express session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

export function registerFactoryRoutes(app: Express) {
  
  // ==================== FACTORY SUBSCRIPTION ROUTES ====================
  
  /**
   * POST /api/factory/subscribe
   * Factory creates a subscription (monthly or annual)
   */
  app.post("/api/factory/subscribe", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { packageType, paymentMethod, paymentReference } = req.body;

      if (!packageType || !['monthly', 'annual'].includes(packageType)) {
        return res.status(400).json({ message: "Valid package type required (monthly or annual)" });
      }

      // Calculate amount based on package
      const monthlyRate = 50000; // ₦50,000 per month
      const annualRate = 500000; // ₦500,000 per year (discounted - saves ₦100,000)
      const amount = packageType === 'monthly' ? monthlyRate : annualRate;

      // Calculate expiry date
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      if (packageType === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Create subscription
      const [subscription] = await db
        .insert(factorySubscriptions)
        .values({
          id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          factoryId: req.session.userId,
          packageType,
          status: 'pending',
          amount,
          startDate,
          expiryDate,
          paymentMethod: paymentMethod || null,
          paymentReference: paymentReference || null,
          paidAt: paymentReference ? new Date() : null,
        })
        .returning();

      res.json({
        success: true,
        subscription,
        message: "Subscription created. Awaiting admin approval.",
      });

    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  /**
   * GET /api/factory/subscription
   * Get factory's active subscription
   */
  app.get("/api/factory/subscription", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [subscription] = await db
        .select()
        .from(factorySubscriptions)
        .where(
          and(
            eq(factorySubscriptions.factoryId, req.session.userId),
            eq(factorySubscriptions.status, "active")
          )
        )
        .orderBy(desc(factorySubscriptions.createdAt))
        .limit(1);

      if (!subscription) {
        return res.json({ hasSubscription: false });
      }

      // Check if expired
      const now = new Date();
      const expiry = new Date(subscription.expiryDate!);
      const isExpired = now > expiry;

      res.json({
        hasSubscription: true,
        subscription: {
          ...subscription,
          isExpired,
          daysRemaining: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        },
      });

    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // ==================== SHIPMENT VERIFICATION ROUTES ====================
  
  /**
   * GET /api/factory/incoming-tokens
   * Get list of transaction tokens awaiting factory verification
   */
  app.get("/api/factory/incoming-tokens", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get tokens that are transferred_to_factory but not yet verified by any factory
      const tokens = await db
        .select({
          id: transactionTokens.id,
          token: transactionTokens.token,
          collectorId: transactionTokens.collectorId,
          vendorId: transactionTokens.vendorId,
          vendorUsername: users.username,
          trashType: transactionTokens.trashType,
          weight: transactionTokens.weight,
          amount: transactionTokens.amount,
          status: transactionTokens.status,
          transferredAt: transactionTokens.transferredAt,
          vendorNotes: transactionTokens.vendorNotes,
        })
        .from(transactionTokens)
        .leftJoin(users, eq(transactionTokens.vendorId, users.id))
        .where(eq(transactionTokens.status, "transferred_to_factory"))
        .orderBy(desc(transactionTokens.transferredAt));

      res.json(tokens);

    } catch (error) {
      console.error("Error fetching incoming tokens:", error);
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  /**
   * POST /api/factory/verify-shipment
   * Factory verifies token and confirms waste received
   */
  app.post("/api/factory/verify-shipment", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { token, notes } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      // Get transaction token
      const [transaction] = await db
        .select()
        .from(transactionTokens)
        .where(eq(transactionTokens.token, token));

      if (!transaction) {
        return res.status(404).json({ message: "Invalid token" });
      }

      if (transaction.status !== "transferred_to_factory") {
        return res.status(400).json({ 
          message: `Cannot verify - current status is ${transaction.status}` 
        });
      }

      // Get rate per ton for this trash type
      const pricePerTon = await getRatePerTon(transaction.trashType);
      const weightInTons = transaction.weight / 1000; // Convert kg to tons
      const totalAmount = Math.round(weightInTons * pricePerTon * 100) / 100;

      // Create factory shipment record
      const [shipment] = await db
        .insert(factoryShipments)
        .values({
          id: `ship_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          factoryId: req.session.userId,
          transactionTokenId: transaction.id,
          token: transaction.token,
          vendorId: transaction.vendorId,
          collectorId: transaction.collectorId,
          trashType: transaction.trashType,
          weight: transaction.weight,
          weightInTons,
          pricePerTon,
          totalAmount,
          status: 'verified',
          verifiedAt: new Date(),
          verifiedBy: req.session.userId,
          factoryNotes: notes || null,
          paymentStatus: 'unpaid',
        })
        .returning();

      // Update transaction token audit trail
      const auditTrailData = transaction.auditTrail as any;
      const currentAuditTrail = typeof auditTrailData === 'string' 
        ? JSON.parse(auditTrailData) 
        : (Array.isArray(auditTrailData) ? auditTrailData : []);
      const newAuditTrail = addAuditEntry(
        currentAuditTrail,
        "verified_by_factory",
        req.session.userId,
        { shipmentId: shipment.id, weightInTons, totalAmount, pricePerTon }
      );

      // Update transaction token status
      await db
        .update(transactionTokens)
        .set({
          factoryId: req.session.userId,
          auditTrail: JSON.stringify(newAuditTrail),
          updatedAt: new Date(),
        })
        .where(eq(transactionTokens.id, transaction.id));

      res.json({
        success: true,
        shipment,
        message: "Shipment verified successfully",
        paymentDue: totalAmount,
      });

    } catch (error) {
      console.error("Error verifying shipment:", error);
      res.status(500).json({ message: "Failed to verify shipment" });
    }
  });

  /**
   * GET /api/factory/verified-shipments
   * Get all verified shipments for this factory
   */
  app.get("/api/factory/verified-shipments", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const shipments = await db
        .select()
        .from(factoryShipments)
        .where(eq(factoryShipments.factoryId, req.session.userId))
        .orderBy(desc(factoryShipments.verifiedAt));

      res.json(shipments);

    } catch (error) {
      console.error("Error fetching shipments:", error);
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  /**
   * POST /api/factory/pay-shipment
   * Factory pays company for verified shipment
   */
  app.post("/api/factory/pay-shipment", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { shipmentId, amount, paymentReference } = req.body;

      if (!shipmentId || !amount || !paymentReference) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get shipment
      const [shipment] = await db
        .select()
        .from(factoryShipments)
        .where(eq(factoryShipments.id, shipmentId));

      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      if (shipment.factoryId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Update shipment payment
      const newPaidAmount = (shipment.paidAmount || 0) + amount;
      const paymentStatus = newPaidAmount >= shipment.totalAmount ? 'paid' : 'partial';

      const [updated] = await db
        .update(factoryShipments)
        .set({
          paidAmount: newPaidAmount,
          paymentStatus,
          paymentReference,
          paidAt: paymentStatus === 'paid' ? new Date() : shipment.paidAt,
          updatedAt: new Date(),
        })
        .where(eq(factoryShipments.id, shipmentId))
        .returning();

      res.json({
        success: true,
        shipment: updated,
        message: paymentStatus === 'paid' ? "Payment completed" : "Partial payment recorded",
      });

    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  /**
   * GET /api/factory/analytics
   * Get factory analytics and statistics
   */
  app.get("/api/factory/analytics", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Total shipments stats
      const [totalStats] = await db
        .select({
          totalShipments: sql<number>`COUNT(*)`,
          totalWeight: sql<number>`SUM(${factoryShipments.weight})`,
          totalWeightTons: sql<number>`SUM(${factoryShipments.weightInTons})`,
          totalAmount: sql<number>`SUM(${factoryShipments.totalAmount})`,
          totalPaid: sql<number>`SUM(${factoryShipments.paidAmount})`,
        })
        .from(factoryShipments)
        .where(eq(factoryShipments.factoryId, req.session.userId));

      // By trash type
      const byType = await db
        .select({
          trashType: factoryShipments.trashType,
          count: sql<number>`COUNT(*)`,
          totalWeight: sql<number>`SUM(${factoryShipments.weightInTons})`,
          totalAmount: sql<number>`SUM(${factoryShipments.totalAmount})`,
        })
        .from(factoryShipments)
        .where(eq(factoryShipments.factoryId, req.session.userId))
        .groupBy(factoryShipments.trashType);

      // By payment status
      const byPaymentStatus = await db
        .select({
          status: factoryShipments.paymentStatus,
          count: sql<number>`COUNT(*)`,
          totalAmount: sql<number>`SUM(${factoryShipments.totalAmount})`,
        })
        .from(factoryShipments)
        .where(eq(factoryShipments.factoryId, req.session.userId))
        .groupBy(factoryShipments.paymentStatus);

      // Current month stats
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const [monthStats] = await db
        .select({
          shipmentsThisMonth: sql<number>`COUNT(*)`,
          weightThisMonth: sql<number>`SUM(${factoryShipments.weightInTons})`,
          paidThisMonth: sql<number>`SUM(${factoryShipments.paidAmount})`,
        })
        .from(factoryShipments)
        .where(
          and(
            eq(factoryShipments.factoryId, req.session.userId),
            sql`${factoryShipments.createdAt} >= ${firstDayOfMonth.getTime() / 1000}`
          )
        );

      res.json({
        overview: {
          ...totalStats,
          outstandingBalance: (totalStats.totalAmount || 0) - (totalStats.totalPaid || 0),
        },
        byTrashType: byType,
        byPaymentStatus: byPaymentStatus,
        currentMonth: monthStats,
      });

    } catch (error) {
      console.error("Error fetching factory analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  /**
   * GET /api/factory/price-list
   * Get current price list per ton
   */
  app.get("/api/factory/price-list", async (req: Request, res: Response) => {
    try {
      const rates = await db
        .select()
        .from(paymentRates)
        .where(eq(paymentRates.isActive, true));

      res.json(rates);

    } catch (error) {
      console.error("Error fetching price list:", error);
      res.status(500).json({ message: "Failed to fetch price list" });
    }
  });
}
