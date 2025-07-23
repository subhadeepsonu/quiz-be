import { Router } from "express";
import {
  getAllTopic,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topic.controller";
import { middleware } from "../middleware/middleware";

export const topicRouter = Router();

topicRouter.get("/", middleware(["user", "admin"]), getAllTopic);
topicRouter.post("/", middleware(["admin"]), createTopic);
topicRouter.put("/:id", middleware(["admin"]), updateTopic);
topicRouter.delete("/:id", middleware(["admin"]), deleteTopic);
