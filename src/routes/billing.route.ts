import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { createCheckoutSession, createPortalSession, createGuestCheckoutSession } from "../controllers/billing.controller";

export const billingRouter = Router();

billingRouter.post("/checkout", middleware(["user", "admin", "editor"]), createCheckoutSession);
billingRouter.post("/checkout-guest", createGuestCheckoutSession);
billingRouter.post("/portal", middleware(["user", "admin", "editor"]), createPortalSession);

