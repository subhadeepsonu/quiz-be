import { prisma } from "../db";

export type AccessLevel = "DIAGNOSTIC_ONLY" | "TRIAL_ACTIVE" | "SUBSCRIBED_ACTIVE";

export async function computeEntitlements(userId: string) {
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      trialEndsAt: true,
      trialUsedAt: true,
    },
  });

  if (!user) return null;

  const activeSubscription = await prisma.subscription.findFirst({
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

  const accessLevel: AccessLevel = hasActiveSubscription
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
}

