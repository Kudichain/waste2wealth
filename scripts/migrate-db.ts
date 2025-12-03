import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting database migration...");
  
  try {
    // Add verified_full_name column to users table
    console.log("Adding verified_full_name column to users table...");
    await db.run(sql`ALTER TABLE users ADD COLUMN verified_full_name TEXT`);
    console.log("✓ Added verified_full_name column");
  } catch (error: any) {
    if (error.message.includes("duplicate column name")) {
      console.log("✓ verified_full_name column already exists");
    } else {
      console.error("Error adding verified_full_name:", error.message);
    }
  }

  try {
    // Create bank_accounts table
    console.log("Creating bank_accounts table...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
        bank_name TEXT NOT NULL,
        bank_code TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_name TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        is_primary INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created bank_accounts table");
  } catch (error: any) {
    console.error("Error creating bank_accounts:", error.message);
  }

  try {
    // Create payment_statements table
    console.log("Creating payment_statements table...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS payment_statements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        transaction_id TEXT REFERENCES transactions(id),
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        balance_before REAL NOT NULL,
        balance_after REAL NOT NULL,
        description TEXT NOT NULL,
        reference TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'completed',
        payment_method TEXT,
        bank_account_id TEXT REFERENCES bank_accounts(id),
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created payment_statements table");
  } catch (error: any) {
    console.error("Error creating payment_statements:", error.message);
  }

  try {
    // Create id_verifications table
    console.log("Creating id_verifications table...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS id_verifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
        id_type TEXT NOT NULL,
        id_number TEXT NOT NULL,
        full_name TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        address TEXT,
        state TEXT,
        id_image_url TEXT,
        verification_status TEXT NOT NULL DEFAULT 'pending',
        verified_by TEXT REFERENCES users(id),
        verified_at INTEGER,
        rejection_reason TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created id_verifications table");
  } catch (error: any) {
    console.error("Error creating id_verifications:", error.message);
  }

  try {
    // Create chat_sessions table
    console.log("Creating chat_sessions table...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        session_type TEXT NOT NULL DEFAULT 'bot',
        status TEXT NOT NULL DEFAULT 'active',
        assigned_agent_id TEXT REFERENCES users(id),
        started_at INTEGER DEFAULT (unixepoch()),
        ended_at INTEGER,
        metadata TEXT
      )
    `);
    console.log("✓ Created chat_sessions table");
  } catch (error: any) {
    console.error("Error creating chat_sessions:", error.message);
  }

  try {
    // Create chat_messages table
    console.log("Creating chat_messages table...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES chat_sessions(id),
        sender_id TEXT REFERENCES users(id),
        sender_type TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created chat_messages table");
  } catch (error: any) {
    console.error("Error creating chat_messages:", error.message);
  }

  console.log("\n✅ Database migration completed!");
  process.exit(0);
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
