import { Request, Response } from "express";
import { loginValidator, registerValidator } from "../validator/auth.validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { StatusCodes } from "http-status-codes";
import { sendPasswordEmail } from "../services/email";
import { hashMagicToken } from "../services/magicLogin";
import { Role } from "@prisma/client";

function signJwt(user: { id: string; role: Role }) {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "30d" });
}

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "http://localhost:3001";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomPassword(): string {
  // Generate an 8-character password with letters and numbers
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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
    const token = signJwt(user);
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

      },
    });
    if (!checkUser) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not found",
      });
      return;
    }
    if (checkUser.role !== "admin" && checkUser.role !== "editor") {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User is not an admin or editor",
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
    const token = signJwt(user);
    res.status(StatusCodes.OK).json({
      message: "Login successful",
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

export async function register(req: Request, res: Response) {
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
    const newUser = await prisma.user.create({
      data: {
        name: check.data.name,
        email: check.data.email,
        password: hashedPassword,
        role: "user",
      },
    });
    const user = {
      id: newUser.id,
      role: newUser.role,
    };
    const token = signJwt(user);
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

export async function start(req: Request, res: Response) {
  try {
    const emailRaw = req.body?.email;
    if (!emailRaw || typeof emailRaw !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Email is required" });
      return;
    }

    const email = normalizeEmail(emailRaw);
    const now = new Date();

    let user = await prisma.user.findUnique({ where: { email } });
    let password: string;
    let isNewUser = false;

    if (!user) {
      // Create new user with random password
      password = randomPassword();
      const hashed = bcrypt.hashSync(password, 10);
      const name = email.split("@")[0] || "User";
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashed,
          role: "user",
        },
      });
      isNewUser = true;
    } else {
      // Existing user - generate new password
      password = randomPassword();
      const hashed = bcrypt.hashSync(password, 10);
      
      // Simple anti-spam: one email per 60s per account
      if (user.magicLoginLastSentAt) {
        const diffMs = now.getTime() - new Date(user.magicLoginLastSentAt).getTime();
        if (diffMs < 60_000) {
          res.status(StatusCodes.OK).json({ message: "If that email exists, we sent login credentials." });
          return;
        }
      }

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          magicLoginLastSentAt: now, // Reuse this field for rate limiting
        },
      });
    }

    // Include flow in login URL if provided
    const flow = req.body?.flow;
    let loginUrl = `${getFrontendBaseUrl()}/auth/login`;
    if (flow && typeof flow === "string") {
      loginUrl += `?flow=${encodeURIComponent(flow)}`;
    }
    await sendPasswordEmail({ to: email, password, loginUrl });

    res.status(StatusCodes.OK).json({ 
      message: isNewUser 
        ? "Account created! Check your email for login credentials." 
        : "If that email exists, we sent login credentials." 
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function verifyMagic(req: Request, res: Response) {
  try {
    const token = req.body?.token;
    if (!token || typeof token !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Token is required" });
      return;
    }

    const tokenHash = hashMagicToken(token);
    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        magicLoginTokenHash: tokenHash,
        magicLoginExpiresAt: { gt: now },
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid or expired token" });
      return;
    }

    // One-time use
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLoginTokenHash: null,
        magicLoginExpiresAt: null,
      },
    });

    const jwtToken = signJwt({ id: user.id, role: user.role });
    res.status(StatusCodes.OK).json({ message: "Login successful", token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}
