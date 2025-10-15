import { Router } from "express";
import { middleware } from "../middleware/middleware";
import {
  getAnswersBySubmission,
  saveAnswer,
} from "../controllers/answer.controller";

export const answerRouter = Router();

answerRouter.post("/", middleware(["user"]), saveAnswer);
answerRouter.get(
  "/:submissionId",
  middleware(["user", "admin"]),
  getAnswersBySubmission
);
