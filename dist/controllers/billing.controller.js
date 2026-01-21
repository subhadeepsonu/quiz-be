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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = createCheckoutSession;
exports.createGuestCheckoutSession = createGuestCheckoutSession;
exports.createPortalSession = createPortalSession;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const stripe_1 = require("../services/stripe");
const email_1 = require("../services/email");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function getFrontendBaseUrl() {
    return process.env.FRONTEND_BASE_URL || "http://localhost:3001";
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function randomPassword() {
    // Generate an 8-character password with letters and numbers
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
function createCheckoutSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
                return;
            }
            const planId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.planId;
            if (!planId || typeof planId !== "string") {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "planId is required" });
                return;
            }
            const plan = yield db_1.prisma.plan.findUnique({ where: { id: planId } });
            if (!plan || !plan.isActive) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Plan not found" });
                return;
            }
            if (!plan.stripePriceId) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ error: "Plan is not configured for Stripe (missing stripePriceId)" });
                return;
            }
            const user = yield db_1.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, stripeCustomerId: true },
            });
            if (!user) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "User not found" });
                return;
            }
            const stripe = (0, stripe_1.getStripe)();
            let customerId = user.stripeCustomerId;
            if (!customerId) {
                const customer = yield stripe.customers.create({
                    email: user.email,
                    metadata: { userId },
                });
                customerId = customer.id;
                yield db_1.prisma.user.update({
                    where: { id: userId },
                    data: { stripeCustomerId: customerId },
                });
            }
            const session = yield stripe.checkout.sessions.create({
                mode: "payment", // One-time payment instead of subscription
                customer: customerId,
                line_items: [{ price: plan.stripePriceId, quantity: 1 }],
                client_reference_id: userId,
                metadata: { userId, planId },
                success_url: `${getFrontendBaseUrl()}/dashboard?checkout=success`,
                cancel_url: `${getFrontendBaseUrl()}/pricing?checkout=cancel`,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({ url: session.url });
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
function createGuestCheckoutSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const emailRaw = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email;
            const planId = (_b = req.body) === null || _b === void 0 ? void 0 : _b.planId;
            if (!emailRaw || typeof emailRaw !== "string") {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Email is required" });
                return;
            }
            if (!planId || typeof planId !== "string") {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "planId is required" });
                return;
            }
            const email = normalizeEmail(emailRaw);
            // Find or create user
            let user = yield db_1.prisma.user.findUnique({ where: { email } });
            let isNewUser = false;
            if (!user) {
                // Create account with random password
                const password = randomPassword();
                const hashed = bcryptjs_1.default.hashSync(password, 10);
                const name = email.split("@")[0] || "User";
                user = yield db_1.prisma.user.create({
                    data: {
                        email,
                        name,
                        password: hashed,
                        role: "user",
                    },
                });
                isNewUser = true;
                // Send password email
                const loginUrl = `${getFrontendBaseUrl()}/auth/login`;
                yield (0, email_1.sendPasswordEmail)({ to: email, password, loginUrl });
            }
            // Get plan
            const plan = yield db_1.prisma.plan.findUnique({ where: { id: planId } });
            if (!plan || !plan.isActive) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Plan not found" });
                return;
            }
            if (!plan.stripePriceId) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Plan is not configured for Stripe (missing stripePriceId)"
                });
                return;
            }
            const stripe = (0, stripe_1.getStripe)();
            // Get or create Stripe customer
            let customerId = user.stripeCustomerId;
            if (!customerId) {
                const customer = yield stripe.customers.create({
                    email: user.email,
                    metadata: { userId: user.id },
                });
                customerId = customer.id;
                yield db_1.prisma.user.update({
                    where: { id: user.id },
                    data: { stripeCustomerId: customerId },
                });
            }
            // Create checkout session
            const session = yield stripe.checkout.sessions.create({
                mode: "payment",
                customer: customerId,
                line_items: [{ price: plan.stripePriceId, quantity: 1 }],
                client_reference_id: user.id,
                metadata: { userId: user.id, planId },
                success_url: `${getFrontendBaseUrl()}/dashboard?checkout=success`,
                cancel_url: `${getFrontendBaseUrl()}/pricing?checkout=cancel`,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                url: session.url,
                message: isNewUser
                    ? "Account created! Check your email for login credentials."
                    : "Redirecting to checkout..."
            });
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
function createPortalSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
                return;
            }
            const user = yield db_1.prisma.user.findUnique({
                where: { id: userId },
                select: { stripeCustomerId: true },
            });
            if (!(user === null || user === void 0 ? void 0 : user.stripeCustomerId)) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "No Stripe customer" });
                return;
            }
            const stripe = (0, stripe_1.getStripe)();
            const session = yield stripe.billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                return_url: `${getFrontendBaseUrl()}/dashboard/settings`,
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({ url: session.url });
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
