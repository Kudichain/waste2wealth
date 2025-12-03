import { db } from "./db";
import { users, factories, tasks, wallets } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Seeding database...");

  try {
    // Create admin user
    const adminId = "admin_user";
    const existingAdmin = await db.select().from(users).where(eq(users.id, adminId));
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        id: adminId,
        username: "admin@m.o.t3ch.io",
        email: "admin@m.o.t3ch.io",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
      console.log("✓ Created admin user (admin@m.o.t3ch.io)");
    }

    // Create or fund admin wallet with 50,000 KOBO
    const existingAdminWallet = await db.select().from(wallets).where(eq(wallets.userId, adminId));
    if (existingAdminWallet.length === 0) {
      await db.insert(wallets).values({
        id: randomUUID(),
        userId: adminId,
        balance: 50000, // 50,000 KOBO
      });
      console.log("✓ Created admin wallet with 50,000 KOBO");
    } else {
      // Update existing wallet to 50,000 KOBO
      await db.update(wallets)
        .set({ balance: 50000 })
        .where(eq(wallets.userId, adminId));
      console.log("✓ Updated admin wallet to 50,000 KOBO");
    }

    // Create or get demo users for factory owners
    const demoUser1Id = "demo-factory-1";
    const demoUser2Id = "demo-factory-2";

    // Check if demo users exist
    const existing1 = await db.select().from(users).where(eq(users.id, demoUser1Id));
    if (existing1.length === 0) {
      await db.insert(users).values({
        id: demoUser1Id,
        username: "kano_recycling",
        email: "factory1@motech.com",
        firstName: "Kano",
        lastName: "Recycling",
        role: "factory",
      });
    }

    const existing2 = await db.select().from(users).where(eq(users.id, demoUser2Id));
    if (existing2.length === 0) {
      await db.insert(users).values({
        id: demoUser2Id,
        username: "green_future",
        email: "factory2@motech.com",
        firstName: "Green",
        lastName: "Future",
        role: "factory",
      });
    }

    console.log("Created demo factory owners");

    // Create demo factories
    const existingFactories = await db.select().from(factories);
    if (existingFactories.length === 0) {
      const demoFactories = await db.insert(factories).values([
        {
          id: randomUUID(),
          name: "Kano Recycling Hub",
          description: "Leading recycling facility in Kano State",
          address: "123 Industrial Road, Kano",
          latitude: 12.0022,
          longitude: 8.5919,
          acceptedTrashTypes: ["plastic", "metal"],
          verified: true,
          phoneNumber: "+234 803 123 4567",
          ownerId: demoUser1Id,
        },
        {
          id: randomUUID(),
          name: "Green Future Recycling",
          description: "Organic waste processing center",
          address: "456 Market Street, Kaduna",
          latitude: 10.5105,
          longitude: 7.4165,
          acceptedTrashTypes: ["organic"],
          verified: true,
          phoneNumber: "+234 803 765 4321",
          ownerId: demoUser2Id,
        },
      ]).returning();

      console.log(`Created ${demoFactories.length} factories`);

      // Create demo tasks
      const demoTasks = await db.insert(tasks).values([
        {
          id: randomUUID(),
          factoryId: demoFactories[0].id,
          type: "plastic",
          weight: 15,
          reward: 150,
          location: "Kano Municipal Market",
          latitude: 12.0,
          longitude: 8.59,
          description: "Collection of plastic bottles and containers",
          status: "available",
        },
        {
          id: randomUUID(),
          factoryId: demoFactories[0].id,
          type: "metal",
          weight: 25,
          reward: 300,
          location: "Sabon Gari Industrial Area",
          latitude: 12.01,
          longitude: 8.6,
          description: "Metal scrap collection from industrial site",
          status: "available",
        },
        {
          id: randomUUID(),
          factoryId: demoFactories[1].id,
          type: "organic",
          weight: 30,
          reward: 180,
          location: "Kurmi Market",
          latitude: 12.005,
          longitude: 8.595,
          description: "Organic waste from market vendors",
          status: "available",
        },
        {
          id: randomUUID(),
          factoryId: demoFactories[0].id,
          type: "plastic",
          weight: 20,
          reward: 200,
          location: "Kano City Center",
          latitude: 11.995,
          longitude: 8.585,
          description: "Plastic waste collection from shopping district",
          status: "available",
        },
      ]).returning();

      console.log(`Created ${demoTasks.length} tasks`);
    } else {
      console.log("Demo data already exists, skipping...");
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
