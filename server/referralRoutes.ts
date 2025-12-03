import type { Express, Request, Response } from "express";
import { db } from "./db";
import { referrals, referralStats, referralMilestones, users, transactions, wallets } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Generate unique referral code
function generateReferralCode(userId: string): string {
  const hash = crypto.createHash('md5').update(userId + Date.now()).digest('hex');
  return `MOT${hash.substring(0, 6).toUpperCase()}`;
}

// Milestone configuration
const MILESTONE_REWARDS = {
  5: 500000,   // 500 KOBO
  10: 1500000, // 1,500 KOBO
  25: 5000000, // 5,000 KOBO
  50: 15000000, // 15,000 KOBO
};

export function registerReferralRoutes(app: Express) {
  
  // GET /api/referrals/my-code - Get or create user's referral code
  app.get("/api/referrals/my-code", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      
      // Check if user already has a referral stat entry
      let stat = await db.query.referralStats.findFirst({
        where: eq(referralStats.userId, userId),
      });

      // If not, create one
      if (!stat) {
        const referralCode = generateReferralCode(userId);
        await db.insert(referralStats).values({
          userId,
          referralCode,
          totalReferrals: 0,
          completedReferrals: 0,
          totalEarnings: 0,
        });

        stat = await db.query.referralStats.findFirst({
          where: eq(referralStats.userId, userId),
        });
      }

      res.json({
        referralCode: stat!.referralCode,
        totalReferrals: stat!.totalReferrals,
        completedReferrals: stat!.completedReferrals,
        totalEarnings: stat!.totalEarnings,
      });
    } catch (error: any) {
      console.error("Error getting referral code:", error);
      res.status(500).json({ message: "Failed to get referral code" });
    }
  });

  // GET /api/referrals/stats - Get detailed referral statistics
  app.get("/api/referrals/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;

      // Get referral stats
      const stats = await db.query.referralStats.findFirst({
        where: eq(referralStats.userId, userId),
      });

      if (!stats) {
        return res.json({
          referralCode: null,
          totalReferrals: 0,
          completedReferrals: 0,
          totalEarnings: 0,
          referralList: [],
          milestones: [],
        });
      }

      // Get list of referrals
      const referralList = await db.query.referrals.findMany({
        where: eq(referrals.referrerId, userId),
        with: {
          referee: {
            columns: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });

      // Get achieved milestones
      const milestones = await db.query.referralMilestones.findMany({
        where: eq(referralMilestones.userId, userId),
      });

      // Calculate next milestone
      const nextMilestone = Object.keys(MILESTONE_REWARDS)
        .map(Number)
        .find(m => m > stats.completedReferrals);

      res.json({
        referralCode: stats.referralCode,
        totalReferrals: stats.totalReferrals,
        completedReferrals: stats.completedReferrals,
        totalEarnings: stats.totalEarnings,
        referralList: referralList.map(r => ({
          id: r.id,
          status: r.status,
          signupDate: r.signupDate,
          firstCollectionDate: r.firstCollectionDate,
          rewardPaid: r.rewardPaid,
          referee: r.referee ? {
            username: r.referee.username,
            name: `${r.referee.firstName || ''} ${r.referee.lastName || ''}`.trim(),
            profileImage: r.referee.profileImageUrl,
          } : null,
        })),
        milestones: milestones.map(m => ({
          milestone: m.milestone,
          bonusAmount: m.bonusAmount,
          achievedAt: m.achievedAt,
          paid: m.paid,
        })),
        nextMilestone,
        nextMilestoneReward: nextMilestone ? MILESTONE_REWARDS[nextMilestone as keyof typeof MILESTONE_REWARDS] : null,
      });
    } catch (error: any) {
      console.error("Error getting referral stats:", error);
      res.status(500).json({ message: "Failed to get referral stats" });
    }
  });

  // POST /api/referrals/claim/:code - Claim a referral code during signup
  app.post("/api/referrals/claim/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Must be logged in to claim referral code" });
      }

      // Find the referrer by code
      const referrerStat = await db.query.referralStats.findFirst({
        where: eq(referralStats.referralCode, code),
      });

      if (!referrerStat) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      if (referrerStat.userId === userId) {
        return res.status(400).json({ message: "You cannot refer yourself" });
      }

      // Check if this user already has been referred
      const existingReferral = await db.query.referrals.findFirst({
        where: eq(referrals.refereeId, userId),
      });

      if (existingReferral) {
        return res.status(400).json({ message: "You have already been referred by someone" });
      }

      // Create referral record
      await db.insert(referrals).values({
        referrerId: referrerStat.userId,
        refereeId: userId,
        referralCode: code,
        status: "pending",
        signupDate: new Date(),
        rewardAmount: 100000, // 100 KOBO
      });

      // Update referrer stats (increment total referrals)
      await db.update(referralStats)
        .set({
          totalReferrals: sql`${referralStats.totalReferrals} + 1`,
          lastUpdated: new Date(),
        })
        .where(eq(referralStats.userId, referrerStat.userId));

      // Award signup bonus to BOTH users (100 KOBO each)
      const signupBonus = 100000; // 100 KOBO in milliKOBO

      // Award to referrer - transaction
      await db.insert(transactions).values({
        id: crypto.randomUUID(),
        userId: referrerStat.userId,
        amount: signupBonus,
        type: "bonus",
        description: `Referral signup bonus - ${code}`,
      });
      
      // Update referrer wallet
      await db.update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${signupBonus}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, referrerStat.userId));

      // Award to referee (new user) - transaction
      await db.insert(transactions).values({
        id: crypto.randomUUID(),
        userId: userId,
        amount: signupBonus,
        type: "bonus",
        description: `Welcome bonus - joined via referral ${code}`,
      });
      
      // Update referee wallet (or create if doesn't exist)
      const existingWallet = await db.query.wallets.findFirst({
        where: eq(wallets.userId, userId),
      });
      
      if (existingWallet) {
        await db.update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${signupBonus}`,
            updatedAt: new Date(),
          })
          .where(eq(wallets.userId, userId));
      } else {
        await db.insert(wallets).values({
          id: crypto.randomUUID(),
          userId: userId,
          balance: signupBonus,
        });
      }

      res.json({
        message: "Referral claimed successfully! You and your referrer both earned 100 KOBO!",
        bonus: signupBonus,
      });
    } catch (error: any) {
      console.error("Error claiming referral:", error);
      res.status(500).json({ message: "Failed to claim referral code" });
    }
  });

  // POST /api/referrals/complete-first-collection - Mark first collection complete (triggers completion bonus)
  app.post("/api/referrals/complete-first-collection", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;

      // Find referral where this user is the referee and status is pending
      const referral = await db.query.referrals.findFirst({
        where: and(
          eq(referrals.refereeId, userId),
          eq(referrals.status, "pending")
        ),
      });

      if (!referral) {
        // User wasn't referred or already completed
        return res.json({ message: "No pending referral to complete" });
      }

      // Update referral to completed
      await db.update(referrals)
        .set({
          status: "completed",
          firstCollectionDate: new Date(),
          rewardPaid: true,
        })
        .where(eq(referrals.id, referral.id));

      // Update referrer stats
      const referrerStat = await db.query.referralStats.findFirst({
        where: eq(referralStats.userId, referral.referrerId),
      });

      if (referrerStat) {
        const newCompletedCount = referrerStat.completedReferrals + 1;
        const newEarnings = referrerStat.totalEarnings + referral.rewardAmount;

        await db.update(referralStats)
          .set({
            completedReferrals: newCompletedCount,
            totalEarnings: newEarnings,
            lastUpdated: new Date(),
          })
          .where(eq(referralStats.userId, referral.referrerId));

        // Check for milestone achievements
        for (const [milestone, bonus] of Object.entries(MILESTONE_REWARDS)) {
          const milestoneNum = Number(milestone);
          if (newCompletedCount === milestoneNum) {
            // Milestone achieved!
            await db.insert(referralMilestones).values({
              userId: referral.referrerId,
              milestone: milestoneNum,
              bonusAmount: bonus,
              paid: false, // Will be paid on next claim
            });

            // Award milestone bonus - transaction
            await db.insert(transactions).values({
              id: crypto.randomUUID(),
              userId: referral.referrerId,
              amount: bonus,
              type: "bonus",
              description: `Referral milestone bonus - ${milestoneNum} referrals!`,
            });
            
            // Update wallet balance
            await db.update(wallets)
              .set({
                balance: sql`${wallets.balance} + ${bonus}`,
                updatedAt: new Date(),
              })
              .where(eq(wallets.userId, referral.referrerId));

            // Mark milestone as paid
            await db.update(referralMilestones)
              .set({ paid: true })
              .where(and(
                eq(referralMilestones.userId, referral.referrerId),
                eq(referralMilestones.milestone, milestoneNum)
              ));

            // Update total earnings
            await db.update(referralStats)
              .set({
                totalEarnings: sql`${referralStats.totalEarnings} + ${bonus}`,
              })
              .where(eq(referralStats.userId, referral.referrerId));
          }
        }
      }

      res.json({
        message: "First collection completed! Referral bonus awarded.",
        referralCompleted: true,
      });
    } catch (error: any) {
      console.error("Error completing first collection:", error);
      res.status(500).json({ message: "Failed to complete first collection" });
    }
  });

  // POST /api/referrals/validate/:code - Validate a referral code (before signup)
  app.post("/api/referrals/validate/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;

      const referrerStat = await db.query.referralStats.findFirst({
        where: eq(referralStats.referralCode, code),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });

      if (!referrerStat) {
        return res.status(404).json({ valid: false, message: "Invalid referral code" });
      }

      res.json({
        valid: true,
        referrer: {
          username: referrerStat.user.username,
          name: `${referrerStat.user.firstName || ''} ${referrerStat.user.lastName || ''}`.trim() || referrerStat.user.username,
          profileImage: referrerStat.user.profileImageUrl,
        },
        bonus: 100000, // 100 KOBO signup bonus
      });
    } catch (error: any) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ valid: false, message: "Failed to validate code" });
    }
  });
}
