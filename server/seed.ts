import { db } from "./db";
import { users, factories, tasks } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  try {
    // Create or get demo users for factory owners
    const demoUser1Id = "demo-factory-1";
    const demoUser2Id = "demo-factory-2";

    // Check if demo users exist
    const existing1 = await db.select().from(users).where(eq(users.id, demoUser1Id));
    if (existing1.length === 0) {
      await db.insert(users).values({
        id: demoUser1Id,
        email: "factory1@greencoin.demo",
        firstName: "Kano",
        lastName: "Recycling",
        role: "factory",
      });
    }

    const existing2 = await db.select().from(users).where(eq(users.id, demoUser2Id));
    if (existing2.length === 0) {
      await db.insert(users).values({
        id: demoUser2Id,
        email: "factory2@greencoin.demo",
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
          name: "Kano Recycling Hub",
          description: "Leading recycling facility in Kano State",
          address: "123 Industrial Road, Kano",
          latitude: "12.0022",
          longitude: "8.5919",
          acceptedTrashTypes: ["plastic", "metal"],
          verified: true,
          phoneNumber: "+234 803 123 4567",
          ownerId: demoUser1Id,
        },
        {
          name: "Green Future Recycling",
          description: "Organic waste processing center",
          address: "456 Market Street, Kaduna",
          latitude: "10.5105",
          longitude: "7.4165",
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
          factoryId: demoFactories[0].id,
          type: "plastic",
          weight: 15,
          reward: 150,
          location: "Kano Municipal Market",
          latitude: "12.0000",
          longitude: "8.5900",
          description: "Collection of plastic bottles and containers",
          status: "available",
        },
        {
          factoryId: demoFactories[0].id,
          type: "metal",
          weight: 25,
          reward: 300,
          location: "Sabon Gari Industrial Area",
          latitude: "12.0100",
          longitude: "8.6000",
          description: "Metal scrap collection from industrial site",
          status: "available",
        },
        {
          factoryId: demoFactories[1].id,
          type: "organic",
          weight: 30,
          reward: 180,
          location: "Kurmi Market",
          latitude: "12.0050",
          longitude: "8.5950",
          description: "Organic waste from market vendors",
          status: "available",
        },
        {
          factoryId: demoFactories[0].id,
          type: "plastic",
          weight: 20,
          reward: 200,
          location: "Kano City Center",
          latitude: "11.9950",
          longitude: "8.5850",
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
