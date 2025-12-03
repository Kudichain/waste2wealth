import 'dotenv/config';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { pool, db } from './db';

console.log('Running migrations...');

migrate(db, { migrationsFolder: './server/migrations' });

console.log('✓ Migrations complete');

process.exit(0);