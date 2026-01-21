import { prisma } from "../db";
import { sendTrialEndedEmail } from "./email";

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "http://localhost:3001";
}

export async function runTrialExpirySweep() {
  const now = new Date();

  const expired = await prisma.user.findMany({
    where: {
      trialEndsAt: { lt: now },
      trialEndedEmailSentAt: null,
      trialUsedAt: { not: null },
    },
    select: { id: true, email: true },
    take: 200,
  });

  if (expired.length === 0) return;

  // Beta: simple email with a link to pricing.
  await Promise.all(
    expired.map(async (u) => {
      const url = `${getFrontendBaseUrl()}/pricing`;
      await sendTrialEndedEmail({ to: u.email, pricingUrl: url });
      await prisma.user.update({
        where: { id: u.id },
        data: { trialEndedEmailSentAt: now },
      });
    })
  );
}

