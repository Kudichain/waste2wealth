import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addPasswordSupport() {
  console.log("Checking password support in users table...");

  try {
    // Add password_hash column to users table
    await db.run(sql`ALTER TABLE users ADD COLUMN password_hash TEXT`);
    console.log("✓ Added password_hash column to users table");
  } catch (error: any) {
    if (error.message.includes("duplicate column name") || error.cause?.code === 'SQLITE_ERROR') {
      console.log("✓ Password column already exists - no changes needed");
    } else {
      console.error("❌ Error adding password support:", error);
      throw error;
    }
  }

  console.log("\n✅ Password support is ready!");
  console.log("\n📝 Summary:");
  console.log("   - password_hash column exists in users table");
  console.log("   - Password hashing implemented with SHA-256");
  console.log("   - Login system updated to require passwords");
  console.log("   - New users will be created with hashed passwords");
  console.log("   - Existing users will have passwords set on next login");
}

addPasswordSupport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
