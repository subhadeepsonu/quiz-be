import { prisma } from "../db";

export type AccessLevel = "DIAGNOSTIC_ONLY" | "TRIAL_ACTIVE" | "SUBSCRIBED_ACTIVE";

export async function computeEntitlements(userId: string) {
  const now = new Date();
  const DAILY_QUESTION_LIMIT =
    Number(process.env.DAILY_QUESTION_LIMIT || 250) || 250;

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

  // Calendar-day question attempts (server timezone).
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfDay.getDate() + 1);

  const dailyQuestionAttempted = await prisma.submittedAnswer.count({
    where: {
      submission: { userId },
      answeredAt: { gte: startOfDay, lt: startOfTomorrow },
    },
  });

  const dailyQuestionLimitReached =
    dailyQuestionAttempted >= DAILY_QUESTION_LIMIT;

  return {
    accessLevel,
    trialEndsAt: user.trialEndsAt,
    trialUsed: !!user.trialUsedAt,
    hasActiveSubscription,
    dailyQuestionLimit: DAILY_QUESTION_LIMIT,
    dailyQuestionAttempted,
    dailyQuestionLimitReached,
    // ISO string so the frontend can compute "resets in X"
    dailyQuestionResetAt: startOfTomorrow.toISOString(),
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

