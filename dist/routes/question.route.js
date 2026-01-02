"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRouter = void 0;
const express_1 = require("express");
const question_controller_1 = require("../controllers/question.controller");
const middleware_1 = require("../middleware/middleware");
const db_1 = require("../db");
exports.questionRouter = (0, express_1.Router)();
exports.questionRouter.get("/", (0, middleware_1.middleware)(["admin", "user", "editor"]), question_controller_1.getAllQuestion);
exports.questionRouter.get("/:id", (0, middleware_1.middleware)(["admin", "user", "editor"]), question_controller_1.getQuestion);
exports.questionRouter.post("/", (0, middleware_1.middleware)(["admin", "editor"]), question_controller_1.createQuestion);
// PUT /api/question/reorder
exports.questionRouter.put("/reorder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizId, questionIds, section } = req.body;
        // Update orderNo for each question
        const updatePromises = questionIds.map((questionId, index) => {
            return db_1.prisma.question.update({
                where: { id: questionId },
                data: { orderNo: index },
            });
        });
        yield Promise.all(updatePromises);
        res.json({
            success: true,
            message: "Questions reordered successfully"
        });
    }
    catch (error) {
        console.error("Error reordering questions:", error);
        res.status(500).json({ error: "Failed to reorder questions" });
    }
}));
exports.questionRouter.put("/:id", (0, middleware_1.middleware)(["admin", "editor"]), question_controller_1.updateQuestion);
exports.questionRouter.delete("/:id", (0, middleware_1.middleware)(["admin", "editor"]), question_controller_1.deleteQuestion);
