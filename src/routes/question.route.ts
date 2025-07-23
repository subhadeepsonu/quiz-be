import { Router } from "express";
import {
  getAllQuestion,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller";
import { middleware } from "../middleware/middleware";

export const questionRouter = Router();

questionRouter.get("/", middleware(["admin", "user"]), getAllQuestion);
questionRouter.get("/:id", middleware(["admin", "user"]), getQuestion);
questionRouter.post("/", middleware(["admin"]), createQuestion);
questionRouter.put("/:id", middleware(["admin"]), updateQuestion);
questionRouter.delete("/:id", middleware(["admin"]), deleteQuestion);
