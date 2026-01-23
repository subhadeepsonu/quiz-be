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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEntitlements = computeEntitlements;
const db_1 = require("../db");
function computeEntitlements(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const user = yield db_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                trialEndsAt: true,
                trialUsedAt: true,
            },
        });
        if (!user)
            return null;
        const activeSubscription = yield db_1.prisma.subscription.findFirst({
            where: {
                userId,
                status: "active",
                endDate: { gt: now },
            },
            orderBy: { endDate: "desc" },
            include: { plan: true },
        });
        const hasActiveSubscription = !!activeSubscription;
        const isTrialActive = !!(user.trialEndsAt && user.trialEndsAt.getTime() > now.getTime());
        const accessLevel = hasActiveSubscription
            ? "SUBSCRIBED_ACTIVE"
            : isTrialActive
                ? "TRIAL_ACTIVE"
                : "DIAGNOSTIC_ONLY";
        return {
            accessLevel,
            trialEndsAt: user.trialEndsAt,
            trialUsed: !!user.trialUsedAt,
            hasActiveSubscription,
            subscription: activeSubscription
                ? {
                    id: activeSubscription.id,
                    status: activeSubscription.status,
                    endDate: activeSubscription.endDate,
                    plan: activeSubscription.plan
                        ? {
                            id: activeSubscription.plan.id,
                            name: activeSubscription.plan.name,
                            price: activeSubscription.plan.price,
                            duration: activeSubscription.plan.duration,
                        }
                        : null,
                }
                : null,
        };
    });
}
