import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "waste2wealth.db");
const db = new Database(dbPath);

console.log("Starting ALTER TABLE migration for verified_full_name...");

try {
  // Check if column exists
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasColumn = columns.some((col: any) => col.name === "verified_full_name");
  
  if (hasColumn) {
    console.log("✓ verified_full_name column already exists");
  } else {
    // Add the column
    db.exec("ALTER TABLE users ADD COLUMN verified_full_name TEXT");
    console.log("✓ Added verified_full_name column to users table");
  }
} catch (error: any) {
  console.error("Error:", error.message);
  process.exit(1);
}

console.log("✅ Migration completed successfully!");
db.close();
process.exit(0);
