import { Router } from "express";
import {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  ChangeRole,
} from "../controllers/user.controller";
import { middleware } from "../middleware/middleware";

export const userRouter = Router();

userRouter.get("/", middleware(["admin"]), getAllUser);
userRouter.get("/me", middleware(["user", "admin"]), getMe);
userRouter.get("/:id", middleware(["admin"]), getUser);
userRouter.post("/", middleware(["admin"]), createUser);
userRouter.put("/:id/promote", middleware(["admin"]), ChangeRole);
userRouter.put("/:id", middleware(["admin"]), updateUser);
userRouter.delete("/:id", middleware(["admin"]), deleteUser);
