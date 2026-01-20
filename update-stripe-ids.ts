import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function updateStripeIds() {
  // Stripe Price IDs from user
  const stripePriceIds = {
    "1 Month": "price_1Sqp36LcAlaLCr1jwzAvophX",
    "3 Months": "price_1Sqp3KLcAlaLCr1jYyCys2FA",
    "6 Months": "price_1Sqp3WLcAlaLCr1jdqGzBJXE",
  };

  console.log("Updating plans with Stripe Price IDs...\n");

  for (const [planName, priceId] of Object.entries(stripePriceIds)) {
    const plan = await prisma.plan.findFirst({
      where: { name: planName },
    });

    if (plan) {
      await prisma.plan.update({
        where: { id: plan.id },
        data: { stripePriceId: priceId },
      });
      console.log(`✓ Updated "${planName}" with Stripe Price ID: ${priceId}`);
    } else {
      console.log(`✗ Plan not found: ${planName}`);
    }
  }

  console.log("\n✅ All plans updated successfully!");
}

updateStripeIds()
  .catch((e) => {
    console.error("❌ Error updating plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
