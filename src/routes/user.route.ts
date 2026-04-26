import { Router } from "express";
import {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  ChangeRole,
  getEntitlements,
  changePassword,
  updateMe,
  getAdminAnalytics,
  exportAdminUsers,
  patchUserActive,
  extendUserMembership,
} from "../controllers/user.controller";
import { middleware } from "../middleware/middleware";

export const userRouter = Router();

userRouter.get("/", middleware(["admin"]), getAllUser);
userRouter.get("/me", middleware(["user", "admin", "editor"]), getMe);
userRouter.put("/me", middleware(["user", "admin", "editor"]), updateMe);
userRouter.put("/me/password", middleware(["user", "admin", "editor"]), changePassword);
userRouter.get(
  "/entitlements",
  middleware(["user", "admin", "editor"]),
  getEntitlements
);
userRouter.get("/admin/analytics", middleware(["admin"]), getAdminAnalytics);
userRouter.get("/admin/export", middleware(["admin"]), exportAdminUsers);
userRouter.patch("/:id/active", middleware(["admin"]), patchUserActive);
userRouter.patch("/:id/subscription/extend", middleware(["admin"]), extendUserMembership);
userRouter.get("/:id", middleware(["admin"]), getUser);
userRouter.post("/", middleware(["admin"]), createUser);
userRouter.put("/:id/promote", middleware(["admin"]), ChangeRole);
userRouter.put("/:id", middleware(["admin"]), updateUser);
userRouter.delete("/:id", middleware(["admin"]), deleteUser);
