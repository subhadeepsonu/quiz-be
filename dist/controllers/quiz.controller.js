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
exports.getAllQuiz = getAllQuiz;
exports.getQuiz = getQuiz;
exports.createQuiz = createQuiz;
exports.updateQuiz = updateQuiz;
exports.TriggerActive = TriggerActive;
exports.reorderQuiz = reorderQuiz;
exports.deleteQuiz = deleteQuiz;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const quiz_validator_1 = require("../validator/quiz.validator");
function getAllQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const category = req.query.category;
            const subCategory = req.query.subCategory;
            console.log(category, subCategory);
            const role = req.userRole;
            console.log("User role:", role);
            const quizzes = yield db_1.prisma.quiz.findMany({
                where: Object.assign(Object.assign(Object.assign(Object.assign({}, (category && { category })), (subCategory && { subCategory })), { isDeleted: false }), (role === "user" ? { isActive: true } : {})),
                include: {
                    questions: {
                        where: {
                            isDeleted: false
                        }
                    },
                    _count: {
                        select: {
                            submissions: {
                                where: {
                                    status: "completed"
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    seqNo: 'asc'
                }
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quizzes fetched successfully",
                data: quizzes,
            });
            return;
        }
        catch (error) {
            console.log(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function getQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const quizId = req.params.id;
            console.log(quizId);
            const quiz = yield db_1.prisma.quiz.findUnique({
                where: { id: quizId, isDeleted: false },
                include: {
                    questions: {
                        where: {
                            isDeleted: false
                        },
                        orderBy: {
                            createdAt: "asc"
                        }
                    },
                },
            });
            if (!quiz) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Quiz not found" });
                return;
            }
            console.log(quiz.questions.length);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz fetched successfully",
                data: quiz,
            });
            return;
        }
        catch (error) {
            console.log(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function createQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = quiz_validator_1.QuizValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const quiz = yield db_1.prisma.quiz.create({
                data: {
                    title: check.data.title,
                    description: check.data.description,
                    category: check.data.category,
                    subCategory: check.data.subCategory,
                    duration: check.data.duration,
                    totalQuestions: check.data.totalQuestions || 0,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "Quiz created successfully",
                data: quiz,
            });
            return;
        }
        catch (error) {
            console.log(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function updateQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const quizId = req.params.id;
            const check = quiz_validator_1.QuizValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const quiz = yield db_1.prisma.quiz.update({
                where: { id: quizId },
                data: {
                    title: check.data.title,
                    description: check.data.description,
                    category: check.data.category,
                    subCategory: check.data.subCategory,
                    duration: check.data.duration,
                    totalQuestions: check.data.totalQuestions || 0,
                    seqNo: check.data.seqNo
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz updated successfully",
                data: quiz,
            });
            return;
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function TriggerActive(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const quizId = req.params.id;
            const quiz = yield db_1.prisma.quiz.findUnique({
                where: { id: quizId },
            });
            if (!quiz) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Quiz not found" });
                return;
            }
            yield db_1.prisma.quiz.update({
                where: { id: quizId },
                data: {
                    isActive: !quiz.isActive,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz status updated successfully",
            });
            return;
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function reorderQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = quiz_validator_1.QuizPatchValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const updateQuiz = yield db_1.prisma.quiz.update({
                where: { id: check.data.quizId },
                data: {
                    seqNo: check.data.seqNo
                }
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quizzes reordered successfully",
                data: updateQuiz
            });
            return;
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function deleteQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const quizId = req.params.id;
            const quiz = yield db_1.prisma.quiz.findUnique({
                where: { id: quizId },
            });
            if (!quiz) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Quiz not found" });
                return;
            }
            yield db_1.prisma.quiz.update({
                where: { id: quizId },
                data: {
                    isDeleted: true,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz deleted successfully",
            });
            return;
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
