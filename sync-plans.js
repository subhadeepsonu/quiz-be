"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
function syncPlans() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const existing = yield prisma.plan.findFirst({
                where: {
                    name: plan.name,
                    duration: plan.duration,
                },
            });
            if (existing) {
                // Update existing plan (but preserve stripePriceId if it exists)
                yield prisma.plan.update({
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
            }
            else {
                // Create new plan
                const created = yield prisma.plan.create({ data: plan });
                console.log(`✓ Created plan: ${plan.name} (ID: ${created.id})`);
            }
        }
        console.log("\n✅ Plans sync completed!");
        console.log("\nNote: You'll need to add stripePriceId to each plan in Stripe Dashboard and update them in the database.");
    });
}
syncPlans()
    .catch((e) => {
    console.error("❌ Error syncing plans:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
