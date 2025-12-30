import { Router } from "express";
import {
  getAllQuiz,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  reorderQuiz,
  TriggerActive,
} from "../controllers/quiz.controller";
import { middleware } from "../middleware/middleware";

export const quizRouter = Router();

quizRouter.get("/", middleware(["admin", "user", "editor"]), getAllQuiz);
quizRouter.get("/:id", middleware(["admin", "user", "editor"]), getQuiz);
quizRouter.post("/", middleware(["admin", "editor"]), createQuiz);
quizRouter.put("/active/:id", middleware(["admin", "editor"]), TriggerActive);
quizRouter.put("/:id", middleware(["admin", "editor"]), updateQuiz);
quizRouter.patch("/reorder", middleware(["admin", "editor"]), reorderQuiz);
quizRouter.delete("/:id", middleware(["admin", "editor"]), deleteQuiz);
