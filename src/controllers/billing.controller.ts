import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middleware/middleware";
import { getStripe } from "../services/stripe";
import { sendPasswordEmail } from "../services/email";
import { generateMagicToken, hashMagicToken } from "../services/magicLogin";
import bcrypt from "bcryptjs";

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "https://ascensa-frontned.vercel.app";
}

function normalizeEmail(email: string): string {
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

export async function createCheckoutSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const planId = req.body?.planId;
    if (!planId || typeof planId !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "planId is required" });
      return;
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Plan not found" });
      return;
    }

    if (!plan.stripePriceId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Plan is not configured for Stripe (missing stripePriceId)" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    const stripe = getStripe();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment instead of subscription
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      client_reference_id: userId,
      metadata: { userId, planId },
      success_url: `${getFrontendBaseUrl()}/dashboard?checkout=success`,
      cancel_url: `${getFrontendBaseUrl()}/pricing?checkout=cancel`,
    });

    res.status(StatusCodes.OK).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function createGuestCheckoutSession(req: Request, res: Response) {
  try {
    const emailRaw = req.body?.email;
    const planId = req.body?.planId;
    
    if (!emailRaw || typeof emailRaw !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Email is required" });
      return;
    }
    
    if (!planId || typeof planId !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "planId is required" });
      return;
    }

    const email = normalizeEmail(emailRaw);
    const nameRaw = req.body?.name;
    const name = nameRaw && typeof nameRaw === "string" && nameRaw.trim() 
      ? nameRaw.trim() 
      : email.split("@")[0] || "User";
    
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;
    
    if (!user) {
      // Create account with random password
      const password = randomPassword();
      const hashed = bcrypt.hashSync(password, 10);
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashed,
          role: "user",
        },
      });
      isNewUser = true;
      
      // Generate magic token for auto-login
      const magicToken = generateMagicToken();
      const tokenHash = hashMagicToken(magicToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store magic token in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          magicLoginTokenHash: tokenHash,
          magicLoginExpiresAt: expiresAt,
        },
      });

      // Create login URLs with checkout flow
      const loginUrl = `${getFrontendBaseUrl()}/auth/login?checkout=true&email=${encodeURIComponent(email)}`;
      const magicLinkUrl = `${getFrontendBaseUrl()}/auth/magic?token=${magicToken}&flow=purchase`;
      
      await sendPasswordEmail({ to: email, password, loginUrl, magicLinkUrl });
    } else if (user && nameRaw && typeof nameRaw === "string" && nameRaw.trim()) {
      // Update existing user's name if provided
      await prisma.user.update({
        where: { id: user.id },
        data: { name: nameRaw.trim() },
      });
    }

    // Get plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Plan not found" });
      return;
    }

    if (!plan.stripePriceId) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: "Plan is not configured for Stripe (missing stripePriceId)" 
      });
      return;
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { userId: user.id, planId },
      success_url: `${getFrontendBaseUrl()}/dashboard?checkout=success`,
      cancel_url: `${getFrontendBaseUrl()}/pricing?checkout=cancel`,
    });

    res.status(StatusCodes.OK).json({ 
      url: session.url,
      message: isNewUser 
        ? "Account created! Check your email for login credentials." 
        : "Redirecting to checkout..." 
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

export async function createPortalSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "No Stripe customer" });
      return;
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getFrontendBaseUrl()}/dashboard/settings`,
    });

    res.status(StatusCodes.OK).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
}

