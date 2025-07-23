import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { loginValidator, registerValidator } from "../validator/auth.validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function login(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = loginValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const checkUser = await prisma.user.findUnique({
      where: {
        email: check.data.email,
        isEmailVerified: true,
      },
    });
    if (!checkUser) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "User not found",
      });
      return;
    }
    const validPassword = bcrypt.compareSync(
      check.data.password,
      checkUser.password
    );
    if (!validPassword) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Invalid password",
      });
      return;
    }
    const user = {
      id: checkUser.id,
      role: checkUser.role,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });
    res.status(StatusCodes.OK).json({
      message: "Login successful",
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
export async function adminLogin(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = loginValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const checkUser = await prisma.user.findUnique({
      where: {
        email: check.data.email,
        isEmailVerified: true,
        role: "admin",
      },
    });
    if (!checkUser) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not found",
      });
      return;
    }
    const validPassword = bcrypt.compareSync(
      check.data.password,
      checkUser.password
    );
    if (!validPassword) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid password",
      });
      return;
    }
    const user = {
      id: checkUser.id,
      role: checkUser.role,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });
    res.status(StatusCodes.OK).json({
      message: "Login successful",
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

export async function register(req: Request, res: Response) {
  try {
    const body = req.body;
    console.log(body);
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
        isEmailVerified: true,
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
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function verify(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function verifyForgotPassword(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
