import { Router } from "express";
import {
  getAllSubmissions,
  getUserSubmissions,
  startSubmission,
  completeSubmission,
  deleteSubmission,
  getSubmissionByQuiz,
} from "../controllers/submission.controller";
import { middleware } from "../middleware/middleware";

export const submissionRouter = Router();

submissionRouter.get("/", middleware(["admin"]), getAllSubmissions);
submissionRouter.get(
  "/user/:userId",
  middleware(["user", "admin"]),
  getUserSubmissions
);
submissionRouter.get(
  "/:quizId",
  middleware(["user", "admin"]),
  getSubmissionByQuiz
);
submissionRouter.post("/", middleware(["user", "admin"]), startSubmission);
submissionRouter.put(
  "/:id/complete",
  middleware(["user", "admin"]),
  completeSubmission
);
submissionRouter.delete("/:id", middleware(["admin"]), deleteSubmission);
