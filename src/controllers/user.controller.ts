import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerValidator } from "../validator/auth.validator";
import { AuthenticatedRequest } from "../middleware/middleware";

export async function getAllUser(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
    });
    const totalUsers = await prisma.user.count({});
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

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.userId;
    const me = await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        name: true,
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
    const newUser = await prisma.user.upsert({
      where: {
        email: check.data.email,
      },
      update: {
        name: check.data.name,
        password: hashedPassword,
        role: "admin",
      },
      create: {
        name: check.data.name,
        email: check.data.email,
        password: hashedPassword,
        role: "admin",
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
    if (body.role != Role.admin && body.role != Role.user) {
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
