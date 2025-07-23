import { Router } from "express";
import {
  getAllQuiz_section,
  getQuiz_section,
  createQuiz_section,
  updateQuiz_section,
  deleteQuiz_section,
} from "../controllers/quiz_section.controller";
import { middleware } from "../middleware/middleware";

export const quiz_sectionRouter = Router();

quiz_sectionRouter.get("/", middleware(["admin", "user"]), getAllQuiz_section);
quiz_sectionRouter.get("/:id", middleware(["admin", "user"]), getQuiz_section);
quiz_sectionRouter.post("/", middleware(["admin"]), createQuiz_section);
quiz_sectionRouter.put("/:id", middleware(["admin"]), updateQuiz_section);
quiz_sectionRouter.delete("/:id", middleware(["admin"]), deleteQuiz_section);
