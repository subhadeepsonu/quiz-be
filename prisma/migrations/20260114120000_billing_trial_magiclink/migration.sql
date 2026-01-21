-- Add billing + trial + magic-link fields

-- User
ALTER TABLE "User"
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "trialStartedAt" TIMESTAMP(3),
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialUsedAt" TIMESTAMP(3),
ADD COLUMN     "trialEndedEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "magicLoginTokenHash" TEXT,
ADD COLUMN     "magicLoginExpiresAt" TIMESTAMP(3),
ADD COLUMN     "magicLoginLastSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- Plan
ALTER TABLE "Plan"
ADD COLUMN     "stripePriceId" TEXT;

CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- Subscription
ALTER TABLE "Subscription"
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

