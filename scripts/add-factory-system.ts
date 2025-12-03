import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addFactorySystemTables() {
  console.log("Creating Factory System tables...\n");

  try {
    // 1. Payment Rates table (admin-editable)
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS payment_rates (
        id TEXT PRIMARY KEY,
        trash_type TEXT NOT NULL UNIQUE,
        rate_per_kg REAL NOT NULL,
        rate_per_ton REAL NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        updated_by TEXT REFERENCES users(id),
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created payment_rates table");

    // Insert default payment rates
    await db.run(sql`
      INSERT OR IGNORE INTO payment_rates (id, trash_type, rate_per_kg, rate_per_ton, description, is_active) VALUES
      ('rate_plastic', 'plastic', 50, 120000, 'High demand, recycling value', 1),
      ('rate_metal', 'metal', 80, 150000, 'Strong resale market', 1),
      ('rate_organic', 'organic', 30, 60000, 'Compost/energy conversion', 1)
    `);
    console.log("✓ Inserted default payment rates");

    // 2. Factory Subscriptions table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS factory_subscriptions (
        id TEXT PRIMARY KEY,
        factory_id TEXT NOT NULL REFERENCES users(id),
        package_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        amount REAL NOT NULL,
        start_date INTEGER,
        expiry_date INTEGER,
        auto_renew INTEGER DEFAULT 0,
        payment_method TEXT,
        payment_reference TEXT,
        paid_at INTEGER,
        approved_by TEXT REFERENCES users(id),
        approved_at INTEGER,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created factory_subscriptions table");

    // 3. Factory Shipments table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS factory_shipments (
        id TEXT PRIMARY KEY,
        factory_id TEXT NOT NULL REFERENCES users(id),
        transaction_token_id TEXT NOT NULL REFERENCES transaction_tokens(id),
        token TEXT NOT NULL,
        vendor_id TEXT NOT NULL REFERENCES users(id),
        collector_id TEXT NOT NULL REFERENCES users(id),
        trash_type TEXT NOT NULL,
        weight REAL NOT NULL,
        weight_in_tons REAL NOT NULL,
        price_per_ton REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_verification',
        verified_at INTEGER,
        verified_by TEXT REFERENCES users(id),
        payment_status TEXT DEFAULT 'unpaid',
        paid_amount REAL DEFAULT 0,
        payment_reference TEXT,
        paid_at INTEGER,
        factory_notes TEXT,
        admin_notes TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created factory_shipments table");

    // Create indexes for performance
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_payment_rates_trash_type ON payment_rates(trash_type)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_factory_subscriptions_factory ON factory_subscriptions(factory_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_factory_subscriptions_status ON factory_subscriptions(status)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_factory_shipments_factory ON factory_shipments(factory_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_factory_shipments_token ON factory_shipments(token)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_factory_shipments_status ON factory_shipments(status)`);
    console.log("✓ Created indexes");

    console.log("\n✅ Factory System tables created successfully!");
    console.log("\n📝 System Features:");
    console.log("   ✓ Admin-editable payment rates (per kg and per ton)");
    console.log("   ✓ Factory subscription packages (monthly/annual)");
    console.log("   ✓ Shipment verification and payment tracking");
    console.log("\n💰 Default Payment Rates:");
    console.log("   - Plastic: ₦50/kg (₦120,000/ton)");
    console.log("   - Metal: ₦80/kg (₦150,000/ton)");
    console.log("   - Organic: ₦30/kg (₦60,000/ton)");
    console.log("\n📊 Subscription Packages:");
    console.log("   - Monthly: Lower entry cost for small factories");
    console.log("   - Annual: Discounted rate for established factories");

  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("✓ Factory system tables already exist");
    } else {
      console.error("❌ Error creating tables:", error);
      throw error;
    }
  }
}

addFactorySystemTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
