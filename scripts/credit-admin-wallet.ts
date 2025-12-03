import { db } from "../server/db";
import { users, wallets, transactions } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script to credit admin wallet with 20,000 KOBO
 * This provides the admin with funds for disbursements and operations
 */

async function creditAdminWallet() {
  try {
    console.log("🔄 Crediting admin wallet with 20,000 KOBO...");

    // Find admin user
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    console.log(`✅ Found admin user: ${adminUser.email || adminUser.username}`);

    // Get or create admin wallet
    let [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, adminUser.id))
      .limit(1);

    if (!wallet) {
      console.log("📝 Creating admin wallet...");
      await db.insert(wallets).values({
        id: `wallet_${adminUser.id}`,
        userId: adminUser.id,
        balance: 0,
        updatedAt: new Date(),
      });

      [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, adminUser.id))
        .limit(1);
    }

    // Credit amount: 20,000 KOBO = 20,000,000 milliKOBO
    const creditAmount = 20000000; // 20,000 KOBO in milliKOBO
    const currentBalance = wallet.balance;
    const newBalance = currentBalance + creditAmount;

    // Update wallet balance
    await db
      .update(wallets)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, adminUser.id));

    console.log(`✅ Updated admin wallet balance: ${currentBalance / 1000} → ${newBalance / 1000} KOBO`);

    // Create transaction record
    const transactionId = `txn_admin_credit_${Date.now()}`;
    await db.insert(transactions).values({
      id: transactionId,
      userId: adminUser.id,
      type: "bonus",
      amount: creditAmount,
      description: "Admin wallet funding - Platform operations and disbursements",
      reference: `ADMIN-CREDIT-${Date.now()}`,
      createdAt: new Date(),
    });

    console.log(`✅ Transaction record created: ${transactionId}`);

    console.log("\n🎉 Admin wallet credit completed successfully!");
    console.log(`   Admin: ${adminUser.email || adminUser.username}`);
    console.log(`   Previous Balance: ${(currentBalance / 1000).toFixed(3)} KOBO (₦${currentBalance.toLocaleString()})`);
    console.log(`   Credit Amount: 20,000 KOBO (₦20,000,000)`);
    console.log(`   New Balance: ${(newBalance / 1000).toFixed(3)} KOBO (₦${newBalance.toLocaleString()})`);
    console.log(`   Ready for collector and vendor disbursements ✓`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error crediting admin wallet:", error);
    process.exit(1);
  }
}

// Run the script
creditAdminWallet();
