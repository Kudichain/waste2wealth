import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users, factories, tasks, transactions, wallets, trashRecords, supportTickets, supportTicketMessages, auditLogs, vendorProfiles, blogPosts, sessions } from '@shared/schema';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export default {
  name: 'initial_migration',
  run: async (db: BetterSQLite3Database) => {
    // Create sessions table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${sessions} (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire INTEGER NOT NULL
      );
    `);

    // Create users table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${users} (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        bio TEXT,
        date_of_birth INTEGER,
        gender TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        id_type TEXT,
        id_number TEXT,
        id_verified INTEGER DEFAULT 0,
        role TEXT CHECK(role IN ('collector', 'vendor', 'factory', 'admin')),
        phone_number TEXT,
        location TEXT,
        verified INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);

    // Create vendor_profiles table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${vendorProfiles} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        business_name TEXT NOT NULL,
        business_logo TEXT,
        contact_name TEXT,
        contact_phone TEXT,
        address TEXT,
        state TEXT NOT NULL,
        lga TEXT NOT NULL,
        ward TEXT,
        business_registration_number TEXT,
        business_certificate TEXT,
        tax_id TEXT,
        years_in_business INTEGER,
        services TEXT,
        description TEXT,
        operating_hours TEXT,
        bank_name TEXT,
        bank_account_name TEXT,
        bank_account_number TEXT,
        bank_code TEXT,
        verified INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create factories table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${factories} (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accepted_trash_types TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        phone_number TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (owner_id) REFERENCES users(id)
      );
    `);

    // Create tasks table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${tasks} (
        id TEXT PRIMARY KEY,
        factory_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('plastic', 'metal', 'organic')),
        weight INTEGER NOT NULL,
        reward INTEGER NOT NULL,
        location TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'accepted', 'in_progress', 'completed', 'verified', 'cancelled')),
        description TEXT,
        collector_id TEXT,
        accepted_at INTEGER,
        completed_at INTEGER,
        verified_at INTEGER,
        verification_code TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (factory_id) REFERENCES factories(id),
        FOREIGN KEY (collector_id) REFERENCES users(id)
      );
    `);

    // Create wallets table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${wallets} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        balance REAL NOT NULL DEFAULT 0,
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create trash_records table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${trashRecords} (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        collector_id TEXT NOT NULL,
        vendor_id TEXT NOT NULL,
        factory_id TEXT,
        trash_type TEXT NOT NULL CHECK(trash_type IN ('plastic', 'metal', 'organic')),
        weight_kg REAL NOT NULL,
        quality_notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending_vendor_confirmation' CHECK(status IN ('pending_vendor_confirmation', 'vendor_confirmed', 'in_transit', 'factory_received', 'payout_released', 'cancelled')),
        committed_payout REAL DEFAULT 0,
        vendor_payout REAL DEFAULT 0,
        submitted_at INTEGER DEFAULT (unixepoch()),
        confirmed_at INTEGER,
        shipped_at INTEGER,
        received_at INTEGER,
        paid_at INTEGER,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (collector_id) REFERENCES users(id),
        FOREIGN KEY (vendor_id) REFERENCES users(id),
        FOREIGN KEY (factory_id) REFERENCES factories(id)
      );
    `);

    // Create transactions table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${transactions} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('earn', 'redeem', 'bonus', 'penalty')),
        amount REAL NOT NULL,
        description TEXT,
        reference TEXT,
        task_id TEXT,
        trash_record_id TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (trash_record_id) REFERENCES trash_records(id)
      );
    `);

    // Create support_tickets table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${supportTickets} (
        id TEXT PRIMARY KEY,
        creator_id TEXT NOT NULL,
        assignee_id TEXT,
        category TEXT NOT NULL CHECK(category IN ('wallet', 'trash_drop', 'vendor_issue', 'factory_issue', 'other')),
        subject TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
        priority INTEGER DEFAULT 2,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        resolved_at INTEGER,
        FOREIGN KEY (creator_id) REFERENCES users(id),
        FOREIGN KEY (assignee_id) REFERENCES users(id)
      );
    `);

    // Create support_ticket_messages table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${supportTicketMessages} (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        message TEXT NOT NULL,
        attachments TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
        FOREIGN KEY (author_id) REFERENCES users(id)
      );
    `);

    // Create audit_logs table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${auditLogs} (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create blog_posts table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ${blogPosts} (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image TEXT,
        published INTEGER DEFAULT 0,
        published_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (author_id) REFERENCES users(id)
      );
    `);
  },
};