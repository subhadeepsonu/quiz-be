import { Router } from "express";
import {
  getAllSubmission,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../controllers/submission.controller";
import { middleware } from "../middleware/middleware";
export const submissionRouter = Router();

submissionRouter.get("/", middleware(["user", "admin"]), getAllSubmission);
submissionRouter.get("/:id", getSubmission);
submissionRouter.post("/", createSubmission);
submissionRouter.put("/:id", updateSubmission);
submissionRouter.delete("/:id", deleteSubmission);
