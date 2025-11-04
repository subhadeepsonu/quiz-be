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
exports.startSubmission = startSubmission;
exports.getAllSubmissions = getAllSubmissions;
exports.getUserSubmissions = getUserSubmissions;
exports.getSubmissionByQuiz = getSubmissionByQuiz;
exports.completeSubmission = completeSubmission;
exports.deleteSubmission = deleteSubmission;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
function startSubmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { quizId } = req.body;
            const userId = req.userId;
            if (!userId || !quizId) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ error: "userId and quizId are required" });
                return;
            }
            const submission = yield db_1.prisma.submission.create({
                data: {
                    userId,
                    quizId,
                    status: "inProgress",
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json(submission);
        }
        catch (error) {
            console.error(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to create submission" });
        }
    });
}
function getAllSubmissions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const submissions = yield db_1.prisma.submission.findMany({
                orderBy: { startedAt: "desc" },
                include: { user: true, quiz: true },
            });
            res.json(submissions);
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to fetch submissions" });
        }
    });
}
function getUserSubmissions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const { quizId, limit } = req.query;
            const whereClause = { userId };
            if (quizId)
                whereClause.quizId = quizId;
            const submissions = yield db_1.prisma.submission.findMany({
                where: whereClause,
                orderBy: { startedAt: "desc" },
                take: limit ? Number(limit) : undefined,
                include: { quiz: true },
            });
            res.json(submissions);
        }
        catch (error) {
            console.error(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to fetch user submissions" });
        }
    });
}
function getSubmissionByQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { quizId } = req.params;
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    error: "Unauthorized: User not found in token",
                });
                return;
            }
            const submission = yield db_1.prisma.submission.findFirst({
                where: {
                    userId,
                    quizId,
                    status: "completed",
                },
                orderBy: { startedAt: "desc" },
                include: {
                    quiz: true,
                    answers: {
                        include: { question: true },
                    },
                },
            });
            if (!submission) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "No submission found for this quiz",
                });
                return;
            }
            const totalTimeSec = submission.answers.reduce((acc, answer) => {
                return acc + (answer.timeTakenSec ? Number(answer.timeTakenSec) : 0);
            }, 0);
            let categorySpecificData = {};
            if (submission.quiz.category === "MOCK_TESTS") {
                categorySpecificData = submission.answers.reduce((acc, answer) => {
                    var _a;
                    let section = (_a = answer.question) === null || _a === void 0 ? void 0 : _a.questionSection;
                    const time = answer.timeTakenSec;
                    if (time != null && section) {
                        if (section === "DATA_INSIGHTS" ||
                            section === "INTEGRATED_REASONING") {
                            section = "DATA_INSIGHTS_AND_IR";
                        }
                        if (!acc[section])
                            acc[section] = { totalTime: 0, questionCount: 0 };
                        acc[section].totalTime += Number(time);
                        acc[section].questionCount += 1;
                    }
                    return acc;
                }, {});
                for (const [section, data] of Object.entries(categorySpecificData)) {
                    data.averageTimePerQuestion =
                        data.questionCount > 0 ? data.totalTime / data.questionCount : 0;
                }
            }
            const avgTimePerQuestionSec = submission.answers.length > 0
                ? totalTimeSec / submission.answers.length
                : 0;
            res.json({
                submission,
                totalTimeSec,
                avgTimePerQuestionSec,
                categorySpecificData,
            });
            return;
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: "Failed to fetch submission results",
            });
            return;
        }
    });
}
function completeSubmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const updated = yield db_1.prisma.submission.update({
                where: { id },
                data: {
                    status: "completed",
                    endedAt: new Date(),
                },
            });
            res.json(updated);
        }
        catch (error) {
            console.error(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to complete submission" });
        }
    });
}
function deleteSubmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield db_1.prisma.submission.delete({ where: { id } });
            res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to delete submission" });
        }
    });
}
