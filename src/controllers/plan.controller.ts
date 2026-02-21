import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { PlanValidator } from "../validator/plan.validator";
import { logger } from "../utils/logger";

export async function getAllPlan(req: Request, res: Response) {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Plans fetched successfully",
      data: plans,
    });
    return;
  } catch (error) {
    logger.error("Error in getAllPlan", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createPlan(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = PlanValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const plan = await prisma.plan.create({
      data: {
        name: check.data.name,
        price: check.data.price,
        duration: check.data.duration,
        description: check.data.description,
      },
    });
    res.status(StatusCodes.CREATED).json({
      message: "Plan created successfully",
      data: plan,
    });
    return;
  } catch (error) {
    logger.error("Error in createPlan", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updatePlan(req: Request, res: Response) {
  try {
    const body = req.body;
    const id = req.params.id;
    const check = PlanValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const checkPlan = await prisma.plan.findUnique({
      where: {
        id: id,
        isActive: true,
      },
    });
    if (!checkPlan) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Plan not found",
      });
      return;
    }
    const plan = await prisma.plan.update({
      where: {
        id: id,
      },
      data: {
        name: check.data.name,
        price: check.data.price,
        duration: check.data.duration,
        description: check.data.description,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Plan updated successfully",
      data: plan,
    });
    return;
  } catch (error) {
    logger.error("Error in updatePlan", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deletePlan(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const checkPlan = await prisma.plan.findUnique({
      where: {
        id: id,
        isActive: true,
      },
    });
    if (!checkPlan) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Plan not found",
      });
      return;
    }
    await prisma.plan.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Plan deleted successfully",
    });
    return;
  } catch (error) {
    logger.error("Error in deletePlan", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
