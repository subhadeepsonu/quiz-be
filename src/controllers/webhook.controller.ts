import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { getStripe } from "../services/stripe";
import { SubscriptionStatus } from "@prisma/client";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function stripeWebhook(req: Request, res: Response) {
  try {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") {
      res.status(StatusCodes.BAD_REQUEST).send("Missing signature");
      return;
    }

    const webhookSecret = requiredEnv("STRIPE_WEBHOOK_SECRET");
    // req.body is Buffer when using express.raw middleware
    const body = req.body as Buffer;
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session?.metadata?.userId;
        const planId = session?.metadata?.planId;
        const paymentMode = session?.mode; // "payment" for one-time, "subscription" for recurring
        
        if (userId && planId) {
          // Get the plan to calculate end date based on duration
          const plan = await prisma.plan.findUnique({
            where: { id: planId },
            select: { duration: true },
          });

          if (plan) {
            const now = new Date();
            // Calculate end date: start date + plan duration (in months)
            const endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + plan.duration);

            // For one-time payments, use payment_intent ID; for subscriptions, use subscription ID
            const paymentId = session?.payment_intent || session?.subscription || session?.id;

            // Check if subscription already exists (avoid duplicates)
            const existing = await prisma.subscription.findFirst({
              where: {
                userId,
                planId,
                status: "active",
                endDate: { gt: now },
              },
            });

            if (!existing) {
              await prisma.subscription.create({
                data: {
                  userId,
                  planId,
                  status: "active",
                  startDate: now,
                  endDate,
                  // Store payment intent ID for one-time payments, or subscription ID for recurring
                  stripeSubscriptionId: paymentId ? String(paymentId) : null,
                },
              }).catch((err) => {
                console.error("Failed to create subscription from webhook:", err);
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        const stripeSubId = sub.id as string;
        const status = sub.status as string;
        const currentPeriodEnd = sub.current_period_end
          ? new Date(Number(sub.current_period_end) * 1000)
          : null;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });
        if (!user) break;

        const mappedStatus: SubscriptionStatus =
          status === "active" || status === "trialing" 
            ? "active" 
            : status === "canceled" 
            ? "cancelled" 
            : "failed";

        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: stripeSubId },
          select: { id: true },
        });

        // Attempt to map Stripe price -> Plan by stripePriceId
        const priceId =
          sub.items?.data?.[0]?.price?.id ||
          sub.items?.data?.[0]?.plan?.id ||
          null;
        const plan = priceId
          ? await prisma.plan.findFirst({ where: { stripePriceId: String(priceId) }, select: { id: true } })
          : null;

        if (existing) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: stripeSubId },
            data: {
              status: mappedStatus,
              endDate: currentPeriodEnd || new Date(),
              currentPeriodEnd: currentPeriodEnd || undefined,
              cancelAtPeriodEnd: !!sub.cancel_at_period_end,
            },
          });
        } else if (plan) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: plan.id,
              status: mappedStatus,
              startDate: new Date(),
              endDate: currentPeriodEnd || new Date(),
              stripeSubscriptionId: stripeSubId,
              currentPeriodEnd: currentPeriodEnd || undefined,
              cancelAtPeriodEnd: !!sub.cancel_at_period_end,
            },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }
}

