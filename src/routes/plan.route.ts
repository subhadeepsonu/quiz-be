import { Router } from "express";
import {
  getAllPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller";
import { middleware } from "../middleware/middleware";

export const planRouter = Router();

planRouter.get("/", getAllPlan);
planRouter.post("/", middleware(["admin"]), createPlan);
planRouter.put("/:id", middleware(["admin"]), updatePlan);
planRouter.delete("/:id", middleware(["admin"]), deletePlan);
