import { Router } from "express";
import {
  getAllQuiz,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller";
import { middleware } from "../middleware/middleware";

export const quizRouter = Router();

quizRouter.get("/", middleware(["admin", "user"]), getAllQuiz);
quizRouter.get("/:id", middleware(["admin", "user"]), getQuiz);
quizRouter.post("/", middleware(["admin"]), createQuiz);
quizRouter.put("/:id", middleware(["admin"]), updateQuiz);
quizRouter.delete("/:id", middleware(["admin"]), deleteQuiz);
