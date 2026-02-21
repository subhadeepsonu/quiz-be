import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middleware/middleware";
import { computeEntitlements } from "../services/entitlements";
import { logger } from "../utils/logger";

export async function startTrial(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const now = new Date();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trialUsedAt: true, trialEndsAt: true },
    });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    if (user.trialUsedAt) {
      res.status(StatusCodes.CONFLICT).json({ error: "Trial already used" });
      return;
    }

    // If already subscribed, there's no need for a trial.
    const ent = await computeEntitlements(userId);
    if (ent?.hasActiveSubscription) {
      res.status(StatusCodes.CONFLICT).json({ error: "Already subscribed" });
      return;
    }

    const trialEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60_000);
    await prisma.user.update({
      where: { id: userId },
      data: {
        trialUsedAt: now,
        trialStartedAt: now,
        trialEndsAt,
      },
    });

    const updated = await computeEntitlements(userId);
    res.status(StatusCodes.OK).json({ message: "Trial started", data: updated });
  } catch (error) {
    logger.error("Error in startTrial", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

