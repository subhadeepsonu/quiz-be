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
exports.saveAnswer = saveAnswer;
exports.getAnswersBySubmission = getAnswersBySubmission;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
function saveAnswer(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { submissionId, questionId, selectedOptions, flagged, timeTakenSec } = req.body;
            if (!submissionId || !questionId) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ error: "submissionId and questionId are required" });
                return;
            }
            const answer = yield db_1.prisma.submittedAnswer.upsert({
                where: {
                    submissionId_questionId: { submissionId, questionId },
                },
                update: {
                    selectedOptions,
                    flagged,
                    timeTakenSec,
                },
                create: {
                    submissionId,
                    questionId,
                    selectedOptions,
                    flagged,
                    timeTakenSec,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json(answer);
        }
        catch (error) {
            console.error(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to save answer" });
        }
    });
}
function getAnswersBySubmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { submissionId } = req.params;
            const answers = yield db_1.prisma.submittedAnswer.findMany({
                where: { submissionId },
                include: { question: true },
            });
            res.json(answers);
        }
        catch (error) {
            console.error(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to fetch answers" });
        }
    });
}
