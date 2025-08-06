import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { generatePresignedUrl } from "../controllers/upload.controller";

export const uploadRouter = Router();

uploadRouter.post("/", middleware(["admin"]), generatePresignedUrl);
