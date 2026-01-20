import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  login,
  register,
  start,
  verify,
  verifyMagic,
  verifyForgotPassword,
} from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";

export const authRouter = Router();

const startLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/login", login);
authRouter.post("/admin/login", adminLogin);
authRouter.post("/register", register);
authRouter.post("/start", startLimiter, start);
authRouter.post("/magic/verify", verifyMagic);
authRouter.post("/verify", verify);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-forgot-password", verifyForgotPassword);
