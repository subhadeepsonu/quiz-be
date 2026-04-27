import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerValidator } from "../validator/auth.validator";
import { changePasswordValidator } from "../validator/auth.validator";
import { AuthenticatedRequest } from "../middleware/middleware";
import { computeEntitlements } from "../services/entitlements";
import { logger } from "../utils/logger";
import { updateMeValidator } from "../validator/user.validator";

type AdminAccessLevel = "DIAGNOSTIC_ONLY" | "TRIAL_ACTIVE" | "SUBSCRIBED_ACTIVE";

function getServerDayBounds(now = new Date()) {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfDay.getDate() + 1);
  return { startOfDay, startOfTomorrow };
}

function getDailyQuestionLimit() {
  return Number(process.env.DAILY_QUESTION_LIMIT || 250) || 250;
}

function computeAdminAccessLevel(params: {
  trialEndsAt: Date | null;
  hasActiveSubscription: boolean;
}): AdminAccessLevel {
  if (params.hasActiveSubscription) return "SUBSCRIBED_ACTIVE";
  if (params.trialEndsAt && params.trialEndsAt.getTime() > Date.now()) {
    return "TRIAL_ACTIVE";
  }
  return "DIAGNOSTIC_ONLY";
}

async function batchDailyQuestionAttempts(
  userIds: string[],
  startOfDay: Date,
  startOfTomorrow: Date
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.$queryRaw<{ userId: string; cnt: bigint }[]>`
    SELECT s."userId" AS "userId", COUNT(sa.id) AS cnt
    FROM "SubmittedAnswer" sa
    INNER JOIN "Submission" s ON s.id = sa."submissionId"
    WHERE sa."answeredAt" >= ${startOfDay}
      AND sa."answeredAt" < ${startOfTomorrow}
      AND s."userId" IN (${Prisma.join(userIds)})
    GROUP BY s."userId"
  `;
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.userId, Number(row.cnt));
  }
  return map;
}

async function batchActiveSubscriptions(userIds: string[], now: Date) {
  const map = new Map<string, { endDate: Date; planName: string | null }>();
  if (userIds.length === 0) return map;
  const subs = await prisma.subscription.findMany({
    where: {
      userId: { in: userIds },
      status: "active",
      endDate: { gt: now },
    },
    include: { plan: true },
    orderBy: { endDate: "desc" },
  });
  for (const s of subs) {
    if (!map.has(s.userId)) {
      map.set(s.userId, {
        endDate: s.endDate,
        planName: s.plan?.name ?? null,
      });
    }
  }
  return map;
}

async function mapUsersToAdminRows(
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    trialEndsAt: Date | null;
    trialUsedAt: Date | null;
  }>
) {
  const now = new Date();
  const { startOfDay, startOfTomorrow } = getServerDayBounds(now);
  const limit = getDailyQuestionLimit();
  const ids = users.map((u) => u.id);
  const [attemptsByUser, subByUser] = await Promise.all([
    batchDailyQuestionAttempts(ids, startOfDay, startOfTomorrow),
    batchActiveSubscriptions(ids, now),
  ]);

  return users.map((u) => {
    const attempted = attemptsByUser.get(u.id) ?? 0;
    const hasActiveSubscription = subByUser.has(u.id);
    const accessLevel = computeAdminAccessLevel({
      trialEndsAt: u.trialEndsAt,
      hasActiveSubscription,
    });
    const remaining = Math.max(0, limit - attempted);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      accessLevel,
      trialEndsAt: u.trialEndsAt,
      trialUsed: !!u.trialUsedAt,
      hasActiveSubscription,
      subscription: subByUser.get(u.id) ?? null,
      membershipDaysLeft: hasActiveSubscription
        ? Math.max(
            0,
            Math.ceil(
              ((subByUser.get(u.id)?.endDate?.getTime() ?? now.getTime()) -
                now.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : null,
      dailyQuestionLimit: limit,
      dailyQuestionAttempted: attempted,
      dailyQuestionRemaining: remaining,
      dailyQuestionLimitReached: attempted >= limit,
      dailyQuestionResetAt: startOfTomorrow.toISOString(),
    };
  });
}

export async function getAllUser(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const searchRaw = (req.query.search as string | undefined)?.trim();

    const where: Prisma.UserWhereInput =
      searchRaw && searchRaw.length > 0
        ? {
            OR: [
              { email: { contains: searchRaw, mode: "insensitive" } },
              { name: { contains: searchRaw, mode: "insensitive" } },
            ],
          }
        : {};

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          trialEndsAt: true,
          trialUsedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const data = await mapUsersToAdminRows(users);

    res.status(StatusCodes.OK).json({
      message: "Users fetched successfully",
      data,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit) || 1,
      },
    });
  } catch (error) {
    logger.error("Error in getAllUser", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
}

export async function getAdminAnalytics(req: Request, res: Response) {
  try {
    const now = new Date();
    const { startOfDay, startOfTomorrow } = getServerDayBounds(now);
    const dailyLimit = getDailyQuestionLimit();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeAccounts,
      inactiveAccounts,
      activeSubscriptions,
      totalSubmissions,
      submissionsLast7Days,
      newUsersLast7Days,
      totalQuizzes,
      totalQuestions,
      usersAtDailyLimitRows,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.subscription.count({
        where: { status: "active", endDate: { gt: now } },
      }),
      prisma.submission.count(),
      prisma.submission.count({
        where: { startedAt: { gte: weekAgo } },
      }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.quiz.count({ where: { isDeleted: false } }),
      prisma.question.count({ where: { isDeleted: false } }),
      prisma.$queryRaw<{ cnt: bigint }[]>`
        SELECT COUNT(*)::bigint AS cnt
        FROM (
          SELECT s."userId"
          FROM "SubmittedAnswer" sa
          INNER JOIN "Submission" s ON s.id = sa."submissionId"
          WHERE sa."answeredAt" >= ${startOfDay}
            AND sa."answeredAt" < ${startOfTomorrow}
          GROUP BY s."userId"
          HAVING COUNT(sa.id) >= ${dailyLimit}
        ) u
      `,
    ]);

    const rawLimitCount = usersAtDailyLimitRows[0]?.cnt;
    const usersAtDailyQuestionLimit =
      rawLimitCount === undefined || rawLimitCount === null
        ? 0
        : typeof rawLimitCount === "bigint"
          ? Number(rawLimitCount)
          : Number(rawLimitCount);

    res.status(StatusCodes.OK).json({
      message: "Analytics fetched",
      data: {
        totalUsers,
        activeAccounts,
        inactiveAccounts,
        activeSubscriptions,
        totalSubmissions,
        submissionsLast7Days,
        newUsersLast7Days,
        totalQuizzes,
        totalQuestions,
        dailyQuestionLimit: dailyLimit,
        usersAtDailyQuestionLimitToday: usersAtDailyQuestionLimit,
      },
    });
  } catch (error) {
    logger.error(
      "Error in getAdminAnalytics",
      error as Error,
      logger.getRequestContext(req)
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function exportAdminUsers(req: Request, res: Response) {
  try {
    const searchRaw = (req.query.search as string | undefined)?.trim();
    const where: Prisma.UserWhereInput =
      searchRaw && searchRaw.length > 0
        ? {
            OR: [
              { email: { contains: searchRaw, mode: "insensitive" } },
              { name: { contains: searchRaw, mode: "insensitive" } },
            ],
          }
        : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10_000,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        trialEndsAt: true,
        trialUsedAt: true,
      },
    });

    const data = await mapUsersToAdminRows(users);

    res.status(StatusCodes.OK).json({
      message: "Export ready",
      data,
    });
  } catch (error) {
    logger.error(
      "Error in exportAdminUsers",
      error as Error,
      logger.getRequestContext(req)
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function extendUserMembership(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id;
    const daysRaw = req.body?.days;
    const planIdRaw = req.body?.planId;
    const extensionTypeRaw = req.body?.extensionType;
    const extensionType =
      extensionTypeRaw === "MONTH_1" ||
      extensionTypeRaw === "MONTH_3" ||
      extensionTypeRaw === "MONTH_6" ||
      extensionTypeRaw === "FREE_TRIAL"
        ? extensionTypeRaw
        : null;
    const days = Number(daysRaw);
    const planId =
      typeof planIdRaw === "string" && planIdRaw.trim().length > 0
        ? planIdRaw.trim()
        : null;

    const extensionDaysFromType =
      extensionType === "MONTH_1"
        ? 30
        : extensionType === "MONTH_3"
          ? 90
          : extensionType === "MONTH_6"
            ? 180
            : extensionType === "FREE_TRIAL"
              ? 30
              : null;
    const effectiveDays = extensionDaysFromType ?? days;
    const forceTrial = extensionType === "FREE_TRIAL" || req.body?.extendAsTrial === true;

    if (
      !Number.isInteger(effectiveDays) ||
      effectiveDays === 0 ||
      effectiveDays > 3650 ||
      effectiveDays < -3650
    ) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error:
          "Provide extensionType (MONTH_1, MONTH_3, MONTH_6, FREE_TRIAL) or a valid days value (-3650 to 3650, excluding 0)",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        trialEndsAt: true,
        trialUsedAt: true,
      },
    });
    if (!existingUser) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    const now = new Date();
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: id,
        status: "active",
        endDate: { gt: now },
      },
      orderBy: { endDate: "desc" },
    });

    if (forceTrial) {
      const trialBase =
        existingUser.trialEndsAt && existingUser.trialEndsAt.getTime() > now.getTime()
          ? new Date(existingUser.trialEndsAt)
          : new Date(now);
      trialBase.setDate(trialBase.getDate() + effectiveDays);

      await prisma.user.update({
        where: { id },
        data: {
          trialEndsAt: trialBase,
          trialUsedAt: existingUser.trialUsedAt ?? now,
        },
      });
    } else if (activeSubscription) {
      const newEndDate = new Date(activeSubscription.endDate);
      newEndDate.setDate(newEndDate.getDate() + effectiveDays);
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          endDate: newEndDate,
          currentPeriodEnd: newEndDate,
          status: "active",
        },
      });
    } else {
      const latestSubscription = await prisma.subscription.findFirst({
        where: { userId: id },
        orderBy: { endDate: "desc" },
        select: { planId: true },
      });

      let targetPlanId = planId ?? latestSubscription?.planId ?? null;
      if (!targetPlanId) {
        const fallbackPlan = await prisma.plan.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        targetPlanId = fallbackPlan?.id ?? null;
      }
      if (!targetPlanId) {
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + effectiveDays);
        await prisma.user.update({
          where: { id },
          data: {
            trialEndsAt: trialEnd,
            trialUsedAt: existingUser.trialUsedAt ?? now,
          },
        });
        const [row] = await mapUsersToAdminRows([existingUser]);
        res.status(StatusCodes.OK).json({
          message: "Trial extended successfully",
          data: row,
        });
        return;
      }
      const selectedPlan = await prisma.plan.findFirst({
        where: { id: targetPlanId, isActive: true },
        select: { id: true },
      });
      if (!selectedPlan) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: "Selected plan is not active or does not exist",
        });
        return;
      }
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + effectiveDays);
      await prisma.subscription.create({
        data: {
          userId: id,
          planId: selectedPlan.id,
          status: "active",
          startDate: now,
          endDate,
          currentPeriodEnd: endDate,
        },
      });
    }

    const [row] = await mapUsersToAdminRows([existingUser]);
    res.status(StatusCodes.OK).json({
      message: "Membership extended successfully",
      data: row,
    });
  } catch (error) {
    logger.error(
      "Error in extendUserMembership",
      error as Error,
      logger.getRequestContext(req)
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function patchUserActive(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id;
    const isActive = req.body?.isActive;
    if (typeof isActive !== "boolean") {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Body must include isActive: boolean" });
      return;
    }
    if (req.userId === id && isActive === false) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "You cannot deactivate your own account while signed in.",
      });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        trialEndsAt: true,
        trialUsedAt: true,
      },
    });
    const [row] = await mapUsersToAdminRows([updated]);
    res.status(StatusCodes.OK).json({
      message: "User updated",
      data: row,
    });
  } catch (error) {
    logger.error("Error in patchUserActive", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.userId;
    const me = await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    if (!me) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "user not found",
      });
      return;
    }
    res.status(StatusCodes.ACCEPTED).json({
      message: "user verifed",
      data: me,
    });
    return;
  } catch (error) {
    logger.error("Error in getMe", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getEntitlements(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const entitlements = await computeEntitlements(userId);
    if (!entitlements) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: "Entitlements fetched",
      data: entitlements,
    });
  } catch (error) {
    logger.error("Error in getEntitlements", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
}
export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }
    const check = changePasswordValidator.safeParse(req.body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Current password and new password (min 8 characters) are required", details: check.error.errors });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }
    const valid = bcrypt.compareSync(check.data.currentPassword, user.password);
    if (!valid) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Current password is incorrect" });
      return;
    }
    const hashed = bcrypt.hashSync(check.data.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    res.status(StatusCodes.OK).json({ message: "Password updated successfully." });
  } catch (error) {
    logger.error("Error in changePassword", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const check = updateMeValidator.safeParse(req.body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: check.data.name },
      select: {
        role: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    logger.error("Error in updateMe", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    logger.error("Error in getUser", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = registerValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email: check.data.email,
      },
    });
    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json({
        error: "User already exists",
      });
      return;
    }
    const hashedPassword = bcrypt.hashSync(check.data.password, 10);
    const role: Role =
      body?.role === Role.admin || body?.role === Role.editor || body?.role === Role.user
        ? body.role
        : Role.user;
    const newUser = await prisma.user.upsert({
      where: {
        email: check.data.email,
      },
      update: {
        name: check.data.name,
        password: hashedPassword,
        role,
      },
      create: {
        name: check.data.name,
        email: check.data.email,
        password: hashedPassword,
        role,
      },
    });
    const user = {
      id: newUser.id,
      role: newUser.role,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });
    res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
      token: token,
    });
    return;
  } catch (error) {
    logger.error("Error in createUser", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
export async function ChangeRole(req: Request, res: Response) {
  try {
    const body = req.body;
    const id = req.params.id;
    if (body.role != Role.admin && body.role != Role.user && body.role != Role.editor) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid request",
      });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
      return;
    }
    await prisma.user.update({
      where: { id },
      data: {
        role: body.role,
      },
    });
    res.status(StatusCodes.ACCEPTED).json({
      message: "User updated",
    });
    return;
  } catch (error) {
    logger.error("Error in ChangeRole", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
export async function updateUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const body = req.body;
    if (body.role != Role.admin && body.role != Role.user && body.role != Role.editor) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid role" });
      return;
    }
    const check = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!check) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: body.role,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "User role updated successfully",
      data: updatedUser,
    });
    return;
  } catch (error) {
    logger.error("Error in updateUser", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    // Delete user-related data in a safe order inside a transaction:
    // 1. Delete submissions (will cascade to SubmittedAnswer via schema)
    // 2. Delete subscriptions
    // 3. Delete the user record itself
    await prisma.$transaction(async (tx) => {
      await tx.submission.deleteMany({
        where: { userId },
      });

      await tx.subscription.deleteMany({
        where: { userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    res.status(StatusCodes.OK).json({
      message: "User deleted successfully",
    });
    return;
  } catch (error) {
    logger.error("Error in deleteUser", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
