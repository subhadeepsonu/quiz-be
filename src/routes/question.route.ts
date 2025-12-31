import { Router } from "express";
import {
  getAllQuestion,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller";
import { middleware } from "../middleware/middleware";
import { prisma } from "../db";

export const questionRouter = Router();

questionRouter.get("/", middleware(["admin", "user", "editor"]), getAllQuestion);
questionRouter.get("/:id", middleware(["admin", "user", "editor"]), getQuestion);
questionRouter.post("/", middleware(["admin", "editor"]), createQuestion);
// PUT /api/question/reorder
questionRouter.put("/reorder", async (req, res) => {
  try {
    const { quizId, questionIds, section } = req.body;

    // Update orderNo for each question
    const updatePromises = questionIds.map((questionId: string, index: number) => {
      return prisma.question.update({
        where: { id: questionId },
        data: { orderNo: index },
      });
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Questions reordered successfully"
    });
  } catch (error) {
    console.error("Error reordering questions:", error);
    res.status(500).json({ error: "Failed to reorder questions" });
  }
});
questionRouter.put("/:id", middleware(["admin", "editor"]), updateQuestion);
questionRouter.delete("/:id", middleware(["admin", "editor"]), deleteQuestion);
