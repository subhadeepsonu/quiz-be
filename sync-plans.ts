import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function syncPlans() {
  const plans = [
    {
      name: "1 Month",
      price: 2999,
      duration: 1,
      description: "Perfect for short-term prep",
      isActive: true,
    },
    {
      name: "3 Months",
      price: 4999,
      duration: 3,
      description: "Ideal for consistent learners",
      isActive: true,
    },
    {
      name: "6 Months",
      price: 7999,
      duration: 6,
      description: "Best for in-depth preparation",
      isActive: true,
    },
  ];

  console.log("Syncing plans to database...\n");

  for (const plan of plans) {
    // Check if plan already exists (by name and duration)
    const existing = await prisma.plan.findFirst({
      where: {
        name: plan.name,
        duration: plan.duration,
      },
    });

    if (existing) {
      // Update existing plan (but preserve stripePriceId if it exists)
      await prisma.plan.update({
        where: { id: existing.id },
        data: {
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
          description: plan.description,
          isActive: plan.isActive,
          // Keep existing stripePriceId if it was set
          stripePriceId: existing.stripePriceId,
        },
      });
      console.log(`✓ Updated plan: ${plan.name} (ID: ${existing.id})`);
    } else {
      // Create new plan
      const created = await prisma.plan.create({ data: plan });
      console.log(`✓ Created plan: ${plan.name} (ID: ${created.id})`);
    }
  }

  console.log("\n✅ Plans sync completed!");
  console.log("\nNote: You'll need to add stripePriceId to each plan in Stripe Dashboard and update them in the database.");
}

syncPlans()
  .catch((e) => {
    console.error("❌ Error syncing plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
