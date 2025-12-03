import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';

const dbPath = path.join(process.cwd(), 'waste2wealth.db');
const sqlite = new Database(dbPath);
const db = drizzle({ client: sqlite, schema });

console.log("✓ Database connection initialized");

export { sqlite as pool, db };
