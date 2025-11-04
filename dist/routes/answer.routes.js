"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware/middleware");
const answer_controller_1 = require("../controllers/answer.controller");
exports.answerRouter = (0, express_1.Router)();
exports.answerRouter.post("/", (0, middleware_1.middleware)(["user", "admin"]), answer_controller_1.saveAnswer);
exports.answerRouter.get("/:submissionId", (0, middleware_1.middleware)(["user", "admin"]), answer_controller_1.getAnswersBySubmission);
