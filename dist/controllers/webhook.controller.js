"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = stripeWebhook;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const stripe_1 = require("../services/stripe");
function requiredEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
function stripeWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            const stripe = (0, stripe_1.getStripe)();
            const sig = req.headers["stripe-signature"];
            if (!sig || typeof sig !== "string") {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send("Missing signature");
                return;
            }
            const webhookSecret = requiredEnv("STRIPE_WEBHOOK_SECRET");
            // req.body is Buffer when using express.raw middleware
            const body = req.body;
            const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object;
                    const userId = (_a = session === null || session === void 0 ? void 0 : session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                    const planId = (_b = session === null || session === void 0 ? void 0 : session.metadata) === null || _b === void 0 ? void 0 : _b.planId;
                    const paymentMode = session === null || session === void 0 ? void 0 : session.mode; // "payment" for one-time, "subscription" for recurring
                    if (userId && planId) {
                        // Get the plan to calculate end date based on duration
                        const plan = yield db_1.prisma.plan.findUnique({
                            where: { id: planId },
                            select: { duration: true },
                        });
                        if (plan) {
                            const now = new Date();
                            // Calculate end date: start date + plan duration (in months)
                            const endDate = new Date(now);
                            endDate.setMonth(endDate.getMonth() + plan.duration);
                            // For one-time payments, use payment_intent ID; for subscriptions, use subscription ID
                            const paymentId = (session === null || session === void 0 ? void 0 : session.payment_intent) || (session === null || session === void 0 ? void 0 : session.subscription) || (session === null || session === void 0 ? void 0 : session.id);
                            // Check if subscription already exists (avoid duplicates)
                            const existing = yield db_1.prisma.subscription.findFirst({
                                where: {
                                    userId,
                                    planId,
                                    status: "active",
                                    endDate: { gt: now },
                                },
                            });
                            if (!existing) {
                                yield db_1.prisma.subscription.create({
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
                    const sub = event.data.object;
                    const customerId = sub.customer;
                    const stripeSubId = sub.id;
                    const status = sub.status;
                    const currentPeriodEnd = sub.current_period_end
                        ? new Date(Number(sub.current_period_end) * 1000)
                        : null;
                    const user = yield db_1.prisma.user.findFirst({
                        where: { stripeCustomerId: customerId },
                        select: { id: true },
                    });
                    if (!user)
                        break;
                    const mappedStatus = status === "active" || status === "trialing"
                        ? "active"
                        : status === "canceled"
                            ? "cancelled"
                            : "failed";
                    const existing = yield db_1.prisma.subscription.findUnique({
                        where: { stripeSubscriptionId: stripeSubId },
                        select: { id: true },
                    });
                    // Attempt to map Stripe price -> Plan by stripePriceId
                    const priceId = ((_f = (_e = (_d = (_c = sub.items) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.price) === null || _f === void 0 ? void 0 : _f.id) ||
                        ((_k = (_j = (_h = (_g = sub.items) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.plan) === null || _k === void 0 ? void 0 : _k.id) ||
                        null;
                    const plan = priceId
                        ? yield db_1.prisma.plan.findFirst({ where: { stripePriceId: String(priceId) }, select: { id: true } })
                        : null;
                    if (existing) {
                        yield db_1.prisma.subscription.update({
                            where: { stripeSubscriptionId: stripeSubId },
                            data: {
                                status: mappedStatus,
                                endDate: currentPeriodEnd || new Date(),
                                currentPeriodEnd: currentPeriodEnd || undefined,
                                cancelAtPeriodEnd: !!sub.cancel_at_period_end,
                            },
                        });
                    }
                    else if (plan) {
                        yield db_1.prisma.subscription.create({
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
        }
        catch (err) {
            console.error(err);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    });
}
