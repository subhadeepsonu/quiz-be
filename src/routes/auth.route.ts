import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  verify,
  verifyForgotPassword,
} from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/verify", verify);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-forgot-password", verifyForgotPassword);
