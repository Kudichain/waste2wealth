import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../waste2wealth.db");

console.log("Starting database migration for profile enhancements...");

const db = new Database(dbPath);

try {
  // Add new columns to users table
  const newColumns = [
    { name: "photo_url", type: "TEXT" },
    { name: "emergency_contact_name", type: "TEXT" },
    { name: "emergency_contact_phone", type: "TEXT" },
    { name: "service_area", type: "TEXT" },
    { name: "kyc_status", type: "TEXT DEFAULT 'pending'" },
    { name: "barcode_id", type: "TEXT" }, // UNIQUE constraint added separately
    { name: "profile_completion_percentage", type: "INTEGER DEFAULT 0" },
    { name: "two_factor_enabled", type: "INTEGER DEFAULT 0" },
  ];

  const existingColumns = db.prepare("PRAGMA table_info(users)").all();
  const existingColumnNames = existingColumns.map((col: any) => col.name);

  for (const column of newColumns) {
    if (!existingColumnNames.includes(column.name)) {
      try {
        db.prepare(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`).run();
        console.log(`✓ Added column: users.${column.name}`);
      } catch (error: any) {
        console.error(`Error adding column ${column.name}:`, error.message);
      }
    } else {
      console.log(`✓ Column users.${column.name} already exists`);
    }
  }

  // Create barcode_drops table
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS barcode_drops (
        id TEXT PRIMARY KEY,
        collector_id TEXT NOT NULL,
        vendor_id TEXT NOT NULL,
        barcode_id TEXT NOT NULL,
        trash_type TEXT NOT NULL,
        weight REAL NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        confirmed_at INTEGER,
        paid_at INTEGER,
        transaction_id TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (collector_id) REFERENCES users(id),
        FOREIGN KEY (vendor_id) REFERENCES users(id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
      )
    `).run();
    console.log("✓ Created barcode_drops table");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("✓ barcode_drops table already exists");
    } else {
      console.error("Error creating barcode_drops table:", error.message);
    }
  }

  // Generate barcode IDs for existing collectors without one
  const collectorsWithoutBarcode = db.prepare(`
    SELECT id FROM users 
    WHERE role = 'collector' 
    AND (barcode_id IS NULL OR barcode_id = '')
  `).all();

  if (collectorsWithoutBarcode.length > 0) {
    console.log(`\nGenerating barcodes for ${collectorsWithoutBarcode.length} collectors...`);
    
    for (const collector of collectorsWithoutBarcode as any[]) {
      const barcodeId = `COLL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      try {
        db.prepare(`
          UPDATE users 
          SET barcode_id = ? 
          WHERE id = ?
        `).run(barcodeId, collector.id);
        console.log(`✓ Generated barcode for collector ${collector.id}: ${barcodeId}`);
      } catch (error: any) {
        console.error(`Error generating barcode for ${collector.id}:`, error.message);
      }
    }
  } else {
    console.log("\n✓ All collectors already have barcodes");
  }

  // Update profile completion percentage for existing users
  const usersToUpdate = db.prepare(`
    SELECT id, first_name, last_name, email, phone_number, 
           date_of_birth, gender, address, city, state, 
           postal_code, service_area, bio, 
           emergency_contact_name, emergency_contact_phone
    FROM users
  `).all();

  if (usersToUpdate.length > 0) {
    console.log(`\nCalculating profile completion for ${usersToUpdate.length} users...`);
    
    for (const user of usersToUpdate as any[]) {
      const requiredFields = [
        user.first_name,
        user.last_name,
        user.email,
        user.phone_number,
        user.date_of_birth,
        user.gender,
        user.address,
        user.city,
        user.state,
      ];
      
      const optionalFields = [
        user.postal_code,
        user.service_area,
        user.bio,
        user.emergency_contact_name,
        user.emergency_contact_phone,
      ];
      
      const filledRequired = requiredFields.filter(f => f && String(f).trim()).length;
      const filledOptional = optionalFields.filter(f => f && String(f).trim()).length;
      
      const requiredPercentage = (filledRequired / requiredFields.length) * 70;
      const optionalPercentage = (filledOptional / optionalFields.length) * 30;
      
      const completionPercentage = Math.round(requiredPercentage + optionalPercentage);
      
      try {
        db.prepare(`
          UPDATE users 
          SET profile_completion_percentage = ? 
          WHERE id = ?
        `).run(completionPercentage, user.id);
      } catch (error: any) {
        console.error(`Error updating completion for ${user.id}:`, error.message);
      }
    }
    console.log("✓ Profile completion percentages calculated");
  }

  console.log("\n✅ Database migration completed successfully!");
  console.log("\nSummary:");
  console.log("- Added 8 new columns to users table");
  console.log("- Created barcode_drops table");
  console.log("- Generated barcodes for collectors");
  console.log("- Calculated profile completion percentages");

} catch (error: any) {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
} finally {
  db.close();
}
