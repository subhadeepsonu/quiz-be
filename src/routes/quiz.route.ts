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

quizRouter.get("/", middleware(["admin", "user"]), getAllQuiz);
quizRouter.get("/:id", middleware(["admin", "user"]), getQuiz);
quizRouter.post("/", middleware(["admin"]), createQuiz);
quizRouter.put("/active/:id", middleware(["admin"]), TriggerActive)
quizRouter.put("/:id", middleware(["admin"]), updateQuiz);
quizRouter.patch("/reorder", middleware(["admin"]), reorderQuiz)

quizRouter.delete("/:id", middleware(["admin"]), deleteQuiz);
