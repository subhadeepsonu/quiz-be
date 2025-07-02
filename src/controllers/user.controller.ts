import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { Role } from "@prisma/client";

export async function getAllUser(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
      where: {
        isEmailVerified: true,
      },
    });
    const totalUsers = await prisma.user.count({
      where: {
        isEmailVerified: true,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total: totalUsers,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
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
    if (body.role != Role.admin || body.role != Role.user) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid role" });
      return;
    }
    const check = await prisma.user.findUnique({
      where: { id: userId, isEmailVerified: true },
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
      where: { id: userId, isEmailVerified: true },
    });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(StatusCodes.OK).json({
      message: "User deleted successfully",
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
