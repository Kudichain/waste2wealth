import { db } from "../server/db";
import { users, wallets, transactions } from "../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function seedAdminWallet() {
  console.log("🔄 Setting up admin wallet with 50,000 KOBO...");

  try {
    // Find admin user
    const admin = await db.query.users.findFirst({
      where: eq(users.role, "admin"),
    });

    if (!admin) {
      console.error("❌ No admin user found. Please create an admin account first.");
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${admin.username}`);

    // Check if wallet exists
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, admin.id),
    });

    const initialBalance = 50000000; // 50,000 KOBO in milliKOBO (1 KOBO = 1000 milliKOBO)

    if (!wallet) {
      // Create wallet with initial balance
      await db.insert(wallets).values({
        id: crypto.randomUUID(),
        userId: admin.id,
        balance: initialBalance,
      });
      console.log(`✅ Created admin wallet with ${initialBalance / 1000} KOBO`);
    } else {
      // Update existing wallet balance
      await db.update(wallets)
        .set({ balance: initialBalance })
        .where(eq(wallets.userId, admin.id));
      console.log(`✅ Updated admin wallet balance to ${initialBalance / 1000} KOBO`);
    }

    // Create transaction record for initial balance
    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId: admin.id,
      amount: initialBalance,
      type: "bonus",
      description: "Initial admin wallet funding for production deployment",
    });
    console.log("✅ Transaction record created");

    // Verify final balance
    wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, admin.id),
    });

    console.log(`\n🎉 Admin wallet setup complete!`);
    console.log(`   Admin: ${admin.username}`);
    console.log(`   Balance: ${wallet!.balance / 1000} KOBO (${wallet!.balance} milliKOBO)`);
    console.log(`   Ready for collector and vendor payments ✓`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seedAdminWallet()
  .then(() => {
    console.log("\n✅ Admin wallet seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
