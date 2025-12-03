// Database Initialization Script
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "waste2wealth.db");

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
  console.log("Removing existing database...");
  fs.unlinkSync(dbPath);
}

if (fs.existsSync(`${dbPath}-shm`)) {
  fs.unlinkSync(`${dbPath}-shm`);
}

if (fs.existsSync(`${dbPath}-wal`)) {
  fs.unlinkSync(`${dbPath}-wal`);
}

console.log("Creating new database...");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

const db = drizzle(sqlite, { schema });

console.log("Running migrations...");

try {
  migrate(db, { migrationsFolder: "./migrations" });
  console.log("✓ Database initialized successfully!");
} catch (error) {
  console.error("Migration error:", error);
  process.exit(1);
}

sqlite.close();
console.log("✓ Database ready for use");
