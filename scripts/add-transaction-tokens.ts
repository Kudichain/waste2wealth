import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addTransactionTokensTable() {
  console.log("Creating transaction_tokens table with security features...\n");

  try {
    // Create transaction_tokens table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS transaction_tokens (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        collector_id TEXT NOT NULL REFERENCES users(id),
        vendor_id TEXT NOT NULL REFERENCES users(id),
        factory_id TEXT REFERENCES users(id),
        barcode_id TEXT NOT NULL,
        trash_type TEXT NOT NULL,
        weight REAL NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_authentication',
        authenticated_at INTEGER,
        transferred_at INTEGER,
        approved_at INTEGER,
        paid_at INTEGER,
        approved_by TEXT REFERENCES users(id),
        is_valid INTEGER DEFAULT 1,
        flagged_reason TEXT,
        audit_trail TEXT NOT NULL DEFAULT '[]',
        vendor_notes TEXT,
        admin_notes TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created transaction_tokens table");

    // Create indexes for performance
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_transaction_tokens_token ON transaction_tokens(token)`);
    console.log("✓ Created index on token");

    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_transaction_tokens_collector ON transaction_tokens(collector_id)`);
    console.log("✓ Created index on collector_id");

    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_transaction_tokens_vendor ON transaction_tokens(vendor_id)`);
    console.log("✓ Created index on vendor_id");

    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_transaction_tokens_status ON transaction_tokens(status)`);
    console.log("✓ Created index on status");

    console.log("\n✅ Transaction tokens table created successfully!");
    console.log("\n📝 Security Features:");
    console.log("   ✓ Unique immutable tokens (TRX-YYYY-TYPE-XXXXX)");
    console.log("   ✓ Complete audit trail in JSON format");
    console.log("   ✓ Fraud prevention with is_valid flag");
    console.log("   ✓ Admin oversight with approval tracking");
    console.log("   ✓ Multi-stage status workflow");
    console.log("\n📊 Transaction Statuses:");
    console.log("   1. pending_authentication - Collector dropped waste");
    console.log("   2. authenticated - Vendor scanned and verified");
    console.log("   3. transferred_to_factory - Vendor sent to factory");
    console.log("   4. payment_approved - Admin approved payment");
    console.log("   5. payment_released - Funds sent to collector");
    console.log("   6. disputed/cancelled - Issues or cancellations");

  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("✓ Transaction tokens table already exists");
    } else {
      console.error("❌ Error creating table:", error);
      throw error;
    }
  }
}

addTransactionTokensTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
