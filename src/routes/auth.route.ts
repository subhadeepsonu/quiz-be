import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  login,
  register,
  verify,
  verifyForgotPassword,
} from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/admin/login", adminLogin);
authRouter.post("/register", register);
authRouter.post("/verify", verify);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-forgot-password", verifyForgotPassword);
