import { db } from "../server/db";
import { referrals, referralStats, referralMilestones } from "../shared/schema";
import { sql } from "drizzle-orm";

async function migrateReferralSystem() {
  console.log("🔄 Creating referral system tables...");

  try {
    // Create referrals table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_id TEXT NOT NULL REFERENCES users(id),
        referee_id TEXT REFERENCES users(id),
        referral_code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'rewarded')),
        signup_date INTEGER,
        first_collection_date INTEGER,
        reward_amount INTEGER NOT NULL DEFAULT 100000,
        reward_paid INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log("✅ Referrals table created");

    // Create referral_milestones table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS referral_milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES users(id),
        milestone INTEGER NOT NULL,
        bonus_amount INTEGER NOT NULL,
        achieved_at INTEGER NOT NULL DEFAULT (unixepoch()),
        paid INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log("✅ Referral milestones table created");

    // Create referral_stats table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS referral_stats (
        user_id TEXT PRIMARY KEY REFERENCES users(id),
        referral_code TEXT NOT NULL UNIQUE,
        total_referrals INTEGER NOT NULL DEFAULT 0,
        completed_referrals INTEGER NOT NULL DEFAULT 0,
        total_earnings INTEGER NOT NULL DEFAULT 0,
        last_updated INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log("✅ Referral stats table created");

    // Create indexes for performance
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_referral_stats_code ON referral_stats(referral_code)`);
    console.log("✅ Indexes created");

    console.log("🎉 Referral system migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

migrateReferralSystem()
  .then(() => {
    console.log("✅ All migrations completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
