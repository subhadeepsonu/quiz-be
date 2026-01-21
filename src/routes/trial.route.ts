import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { startTrial } from "../controllers/trial.controller";

export const trialRouter = Router();

trialRouter.post("/start", middleware(["user", "admin", "editor"]), startTrial);

