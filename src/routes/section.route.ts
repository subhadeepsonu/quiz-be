import { Router } from "express";
import {
  getAllSection,
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/section.controller";
import { middleware } from "../middleware/middleware";

export const sectionRouter = Router();

sectionRouter.get("/", middleware(["admin", "user"]), getAllSection);
sectionRouter.post("/", middleware(["admin"]), createSection);
sectionRouter.put("/:id", middleware(["admin"]), updateSection);
sectionRouter.delete("/:id", middleware(["admin"]), deleteSection);
