import type { Express } from "express";
import { db } from "./db";
import { paymentRates, users, transactionTokens, bankAccounts } from "@shared/schema";
import { and, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";

// Extend Express session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

/**
 * Admin Routes for Payment Rate Management
 * Admin can view and edit payment rates for all trash types
 */
export function registerAdminRoutes(app: Express) {
  
  /**
   * GET /api/admin/payment-rates
   * Get all payment rates (active and inactive)
   * Returns list of all rates with metadata
   */
  app.get("/api/admin/payment-rates", async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      // Get user from session
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);
      if (user.role !== "admin") {
        return res.status(403).send("Forbidden: Admin access only");
      }

      // Get all payment rates with updater info
      const rates = await db
        .select({
          id: paymentRates.id,
          trashType: paymentRates.trashType,
          ratePerKg: paymentRates.ratePerKg,
          ratePerTon: paymentRates.ratePerTon,
          description: paymentRates.description,
          isActive: paymentRates.isActive,
          updatedBy: paymentRates.updatedBy,
          updatedAt: paymentRates.updatedAt,
          createdAt: paymentRates.createdAt,
        })
        .from(paymentRates)
        .orderBy(paymentRates.trashType);

      // Get updater usernames for display
      const ratesWithUpdaterNames = await Promise.all(
        rates.map(async (rate: any) => {
          let updaterName = "System";
          if (rate.updatedBy) {
            const [updater] = await db
              .select({ username: users.username })
              .from(users)
              .where(eq(users.id, rate.updatedBy))
              .limit(1);
            if (updater) {
              updaterName = updater.username;
            }
          }
          return {
            ...rate,
            updaterName,
          };
        })
      );

      res.json(ratesWithUpdaterNames);
    } catch (error) {
      console.error("Error fetching payment rates:", error);
      res.status(500).send("Failed to fetch payment rates");
    }
  });

  /**
   * PUT /api/admin/payment-rates/:id
   * Update a payment rate
   * Body: { ratePerKg: number, ratePerTon: number, description?: string, isActive?: boolean }
   * 
   * Validation:
   * - ratePerKg and ratePerTon must be positive numbers
   * - ratePerTon should be approximately 1800-2200x ratePerKg (1 ton = 1000 kg + markup)
   * - Records admin who made the change
   */
  app.put("/api/admin/payment-rates/:id", async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      // Get user from session
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);
      if (user.role !== "admin") {
        return res.status(403).send("Forbidden: Admin access only");
      }

      const rateId = req.params.id; // ID is a string, not a number
      const { ratePerKg, ratePerTon, description, isActive } = req.body;

      // Validation
      if (typeof ratePerKg !== "number" || ratePerKg <= 0) {
        return res.status(400).send("Invalid ratePerKg: must be a positive number");
      }

      if (typeof ratePerTon !== "number" || ratePerTon <= 0) {
        return res.status(400).send("Invalid ratePerTon: must be a positive number");
      }

      // Validate relationship between per kg and per ton rates
      // 1 ton = 1000 kg, so per ton should be roughly 1800-2200x per kg (with markup)
      const expectedMinTonRate = ratePerKg * 1800;
      const expectedMaxTonRate = ratePerKg * 2200;
      
      if (ratePerTon < expectedMinTonRate || ratePerTon > expectedMaxTonRate) {
        return res.status(400).send(
          `Rate mismatch: Per ton rate (₦${ratePerTon.toLocaleString()}) should be between ` +
          `₦${expectedMinTonRate.toLocaleString()} and ₦${expectedMaxTonRate.toLocaleString()} ` +
          `based on per kg rate of ₦${ratePerKg}. (1 ton = 1000 kg with typical markup)`
        );
      }

      // Check if rate exists
      const [existingRate] = await db
        .select()
        .from(paymentRates)
        .where(eq(paymentRates.id, rateId))
        .limit(1);

      if (!existingRate) {
        return res.status(404).send("Payment rate not found");
      }

      // Update the rate
      const updateData: any = {
        ratePerKg,
        ratePerTon,
        updatedBy: user.id,
        updatedAt: new Date(),
      };

      if (description !== undefined) {
        updateData.description = description;
      }

      if (typeof isActive === "boolean") {
        updateData.isActive = isActive;
      }

      await db
        .update(paymentRates)
        .set(updateData)
        .where(eq(paymentRates.id, rateId));

      // Fetch updated rate
      const [updatedRate] = await db
        .select()
        .from(paymentRates)
        .where(eq(paymentRates.id, rateId))
        .limit(1);

      // Log the change for audit trail
      console.log(`Payment rate updated by admin ${user.username} (ID: ${user.id}):`);
      console.log(`  Trash Type: ${updatedRate.trashType}`);
      console.log(`  Old Rate Per Kg: ₦${existingRate.ratePerKg} → New: ₦${updatedRate.ratePerKg}`);
      console.log(`  Old Rate Per Ton: ₦${existingRate.ratePerTon} → New: ₦${updatedRate.ratePerTon}`);
      console.log(`  Active: ${updatedRate.isActive}`);

      res.json({
        message: "Payment rate updated successfully",
        rate: updatedRate,
        changes: {
          ratePerKg: {
            old: existingRate.ratePerKg,
            new: updatedRate.ratePerKg,
          },
          ratePerTon: {
            old: existingRate.ratePerTon,
            new: updatedRate.ratePerTon,
          },
        },
      });
    } catch (error) {
      console.error("Error updating payment rate:", error);
      res.status(500).send("Failed to update payment rate");
    }
  });

  /**
   * NOTE: Creating NEW trash types (POST endpoint) requires database migration
   * due to enum constraints. This endpoint is commented out for now.
   * Admins can only update EXISTING trash type rates (plastic, metal, organic).
   */

  /**
   * DELETE /api/admin/payment-rates/:id
   * Deactivate a payment rate (soft delete)
   * Does not actually delete the rate, just sets isActive = false
   */
  app.delete("/api/admin/payment-rates/:id", async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      // Get user from session
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);
      if (user.role !== "admin") {
        return res.status(403).send("Forbidden: Admin access only");
      }

      const rateId = req.params.id; // ID is a string, not a number

      // Check if rate exists
      const [existingRate] = await db
        .select()
        .from(paymentRates)
        .where(eq(paymentRates.id, rateId))
        .limit(1);

      if (!existingRate) {
        return res.status(404).send("Payment rate not found");
      }

      // Soft delete by setting isActive = false
      await db
        .update(paymentRates)
        .set({
          isActive: false,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(paymentRates.id, rateId));

      console.log(`Payment rate deactivated by admin ${user.username}: ${existingRate.trashType}`);

      res.json({
        message: "Payment rate deactivated successfully",
        trashType: existingRate.trashType,
      });
    } catch (error) {
      console.error("Error deactivating payment rate:", error);
      res.status(500).send("Failed to deactivate payment rate");
    }
  });

  /**
   * GET /api/admin/settlements
   * Treasury feed for collector/vendor settlements with optional filters
   * Query params:
   *  - role: collector | vendor (default collector)
   *  - dateRange: 24h | 7d | 30d | 90d | custom (default 24h)
   *  - startDate / endDate (ISO strings, used when dateRange=custom)
   *  - state: filter by user state/region
   */
  app.get("/api/admin/settlements", async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);

      if (!user || user.role !== "admin") {
        return res.status(403).send("Forbidden: Admin access only");
      }

      const roleParam = req.query.role === "vendor" ? "vendor" : "collector";
      const dateRange = typeof req.query.dateRange === "string" ? req.query.dateRange : "24h";
      const allowedRanges: Record<string, number> = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "90d": 90 * 24 * 60 * 60 * 1000,
      };

      let endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      if (Number.isNaN(endDate.getTime())) {
        endDate = new Date();
      }

      let startDate: Date;
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      } else {
        const rangeMs = allowedRanges[dateRange] ?? allowedRanges["24h"];
        startDate = new Date(endDate.getTime() - rangeMs);
      }
      if (Number.isNaN(startDate.getTime())) {
        const fallbackRange = allowedRanges["24h"];
        startDate = new Date(endDate.getTime() - fallbackRange);
      }

      const stateFilter = typeof req.query.state === "string" && req.query.state.trim().length > 0
        ? req.query.state.trim()
        : undefined;

      const actorColumn = roleParam === "collector" ? transactionTokens.collectorId : transactionTokens.vendorId;

      const filters = [
        isNotNull(actorColumn),
        gte(transactionTokens.createdAt, startDate),
        lte(transactionTokens.createdAt, endDate),
      ];

      if (stateFilter) {
        filters.push(eq(users.state, stateFilter));
      }

      const rows = await db
        .select({
          id: transactionTokens.id,
          token: transactionTokens.token,
          status: transactionTokens.status,
          weight: transactionTokens.weight,
          amount: transactionTokens.amount,
          createdAt: transactionTokens.createdAt,
          paidAt: transactionTokens.paidAt,
          metadata: transactionTokens.metadata,
          isValid: transactionTokens.isValid,
          flaggedReason: transactionTokens.flaggedReason,
          actorId: actorColumn,
          actorFirstName: users.firstName,
          actorLastName: users.lastName,
          actorFullName: users.verifiedFullName,
          actorUsername: users.username,
          city: users.city,
          state: users.state,
          bankName: bankAccounts.bankName,
          accountNumber: bankAccounts.accountNumber,
          channel: sql<string | null>`json_extract(${transactionTokens.metadata}, '$.channel')`,
          paymentMethod: sql<string | null>`json_extract(${transactionTokens.metadata}, '$.paymentMethod')`,
        })
        .from(transactionTokens)
        .leftJoin(users, eq(actorColumn, users.id))
        .leftJoin(bankAccounts, eq(bankAccounts.userId, users.id))
        .where(and(...filters))
        .orderBy(desc(transactionTokens.createdAt))
        .limit(120);

      const settlementDurations: number[] = [];
      const availableStates = new Set<string>();

      const transactions = rows.map((row) => {
        const metadata = typeof row.metadata === "string" ? safeJsonParse(row.metadata) : row.metadata;
        const actorName =
          row.actorFullName ||
          [row.actorFirstName, row.actorLastName].filter(Boolean).join(" ") ||
          row.actorUsername ||
          "Unknown";
        const location = [row.city, row.state].filter(Boolean).join(", ") || "—";
        if (row.state) {
          availableStates.add(row.state);
        }

        const statusValue = row.status || "pending";
        let statusBucket: "settled" | "pending" | "flagged";
        if (!row.isValid || statusValue.includes("flag") || statusValue.includes("disput") || row.flaggedReason) {
          statusBucket = "flagged";
        } else if (statusValue.includes("pending") || statusValue.includes("auth") || statusValue.includes("transfer")) {
          statusBucket = "pending";
        } else {
          statusBucket = "settled";
        }

        if (row.paidAt && row.createdAt) {
          const paidTs = new Date(row.paidAt).getTime();
          const createdTs = new Date(row.createdAt).getTime();
          if (!Number.isNaN(paidTs) && !Number.isNaN(createdTs) && paidTs >= createdTs) {
            settlementDurations.push((paidTs - createdTs) / 1000);
          }
        }

        const bankLabel = row.bankName && row.accountNumber
          ? `${row.bankName} • ${row.accountNumber.slice(-4)}`
          : "Wallet Rail";

        const channel = metadata?.channel || row.channel || (roleParam === "collector" ? "Instant Payout" : "Treasury Sweep");

        return {
          id: row.id,
          reference: row.token,
          actorName,
          role: roleParam,
          weight: row.weight ?? 0,
          amount: row.amount ?? 0,
          status: statusValue,
          statusBucket,
          location,
          state: row.state,
          city: row.city,
          bank: bankLabel,
          channel,
          timestamp: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      const summary = transactions.reduce(
        (acc, tx) => {
          acc.totalAmount += tx.amount;
          if (tx.statusBucket === "pending") {
            acc.pendingAmount += tx.amount;
          }
          if (tx.statusBucket === "flagged") {
            acc.flaggedCount += 1;
          }
          if (tx.statusBucket === "settled") {
            acc.settledCount += 1;
          }
          return acc;
        },
        {
          totalAmount: 0,
          pendingAmount: 0,
          flaggedCount: 0,
          settledCount: 0,
          count: transactions.length,
          avgSettlementSeconds: 0,
        }
      );

      if (settlementDurations.length > 0) {
        summary.avgSettlementSeconds = Math.round(
          settlementDurations.reduce((sum, val) => sum + val, 0) / settlementDurations.length
        );
      }

      res.json({
        role: roleParam,
        window: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        filters: {
          dateRange,
          state: stateFilter ?? null,
        },
        summary,
        availableStates: Array.from(availableStates).sort(),
        transactions,
      });
    } catch (error) {
      console.error("Error fetching treasury settlements:", error);
      res.status(500).send("Failed to fetch settlements");
    }
  });

  console.log("✓ Admin payment & treasury routes registered");
}

function safeJsonParse(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
