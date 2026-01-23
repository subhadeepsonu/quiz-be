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
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
function updateStripeIds() {
    return __awaiter(this, void 0, void 0, function* () {
        // Stripe Price IDs from user
        const stripePriceIds = {
            "1 Month": "price_1Sqp36LcAlaLCr1jwzAvophX",
            "3 Months": "price_1Sqp3KLcAlaLCr1jYyCys2FA",
            "6 Months": "price_1Sqp3WLcAlaLCr1jdqGzBJXE",
        };
        console.log("Updating plans with Stripe Price IDs...\n");
        for (const [planName, priceId] of Object.entries(stripePriceIds)) {
            const plan = yield prisma.plan.findFirst({
                where: { name: planName },
            });
            if (plan) {
                yield prisma.plan.update({
                    where: { id: plan.id },
                    data: { stripePriceId: priceId },
                });
                console.log(`✓ Updated "${planName}" with Stripe Price ID: ${priceId}`);
            }
            else {
                console.log(`✗ Plan not found: ${planName}`);
            }
        }
        console.log("\n✅ All plans updated successfully!");
    });
}
updateStripeIds()
    .catch((e) => {
    console.error("❌ Error updating plans:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
