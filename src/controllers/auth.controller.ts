import { Request, Response } from "express";
import { loginValidator, registerValidator, forgotPasswordValidator, verifyForgotPasswordValidator } from "../validator/auth.validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { StatusCodes } from "http-status-codes";
import { sendPasswordEmail, sendPasswordResetEmail } from "../services/email";
import { generateMagicToken, hashMagicToken } from "../services/magicLogin";
import { Role } from "@prisma/client";
import { logger } from "../utils/logger";

function signJwt(user: { id: string; role: Role }) {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "30d" });
}

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "https://ascensaprep.com";
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
    logger.error("Error in login", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in adminLogin", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in register", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in verify", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const check = forgotPasswordValidator.safeParse(req.body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Valid email is required", details: check.error.errors });
      return;
    }
    const email = normalizeEmail(check.data.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(StatusCodes.OK).json({ message: "If that email is registered, you will receive a password reset link." });
      return;
    }
    const token = generateMagicToken();
    const tokenHash = hashMagicToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
    });
    const resetUrl = `${getFrontendBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail({ to: email, resetUrl });
    res.status(StatusCodes.OK).json({ message: "If that email is registered, you will receive a password reset link." });
  } catch (error) {
    logger.error("Error in forgotPassword", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function verifyForgotPassword(req: Request, res: Response) {
  try {
    const check = verifyForgotPasswordValidator.safeParse(req.body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Token and new password (min 8 characters) are required", details: check.error.errors });
      return;
    }
    const tokenHash = hashMagicToken(check.data.token);
    const now = new Date();
    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: now },
      },
    });
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid or expired reset link. Please request a new one." });
      return;
    }
    const hashed = bcrypt.hashSync(check.data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
    res.status(StatusCodes.OK).json({ message: "Password updated. You can now sign in with your new password." });
  } catch (error) {
    logger.error("Error in verifyForgotPassword", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
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
    const nameRaw = req.body?.name;
    const name = nameRaw && typeof nameRaw === "string" && nameRaw.trim()
      ? nameRaw.trim()
      : email.split("@")[0] || "User";

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      res.status(StatusCodes.CONFLICT).json({
        error: "This email is already registered. Please sign in or use Forgot password.",
      });
      return;
    }

    // Create new user with random password
    const password = randomPassword();
    const hashed = bcrypt.hashSync(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: "user",
      },
    });

    // Generate magic token for auto-login
    const magicToken = generateMagicToken();
    const tokenHash = hashMagicToken(magicToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        magicLoginTokenHash: tokenHash,
        magicLoginExpiresAt: expiresAt,
      },
    });

    const flow = req.body?.flow;
    let loginUrl = `${getFrontendBaseUrl()}/auth/login`;
    let magicLinkUrl = `${getFrontendBaseUrl()}/auth/magic?token=${magicToken}`;
    if (flow && typeof flow === "string") {
      loginUrl += `?flow=${encodeURIComponent(flow)}`;
      magicLinkUrl += `&flow=${encodeURIComponent(flow)}`;
    }

    await sendPasswordEmail({ to: email, password, loginUrl, magicLinkUrl });

    res.status(StatusCodes.OK).json({
      message: "Account created! Check your email for login credentials.",
    });
  } catch (error) {
    logger.error("Error in start (magic login)", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in verifyMagic", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}
