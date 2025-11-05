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
exports.getAllQuestion = getAllQuestion;
exports.getQuestion = getQuestion;
exports.createQuestion = createQuestion;
exports.updateQuestion = updateQuestion;
exports.deleteQuestion = deleteQuestion;
exports.getQuestionsByCategory = getQuestionsByCategory;
exports.reorderQuestions = reorderQuestions;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const question_validator_1 = require("../validator/question.validator");
function getAllQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const quizId = req.query.quizId;
            if (!quizId) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ error: "Quiz ID is required" });
                return;
            }
            const questions = yield db_1.prisma.question.findMany({
                where: {
                    quizId: quizId,
                    isDeleted: false,
                },
                orderBy: {
                    orderIndex: 'asc'
                }
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Questions fetched successfully",
                data: questions,
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
function getQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const question = yield db_1.prisma.question.findUnique({
                where: {
                    id: id,
                    isDeleted: false,
                },
            });
            if (!question) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "Question not found",
                });
                return;
            }
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Question fetched successfully",
                data: question,
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
function createQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = question_validator_1.QuestionSchema.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const question = yield db_1.prisma.question.create({
                data: {
                    questionText: check.data.questionText,
                    image: check.data.image,
                    questionType: check.data.questionType,
                    questionSection: null,
                    questionTopic: check.data.questionTopic,
                    paragraphText: check.data.paragraphText,
                    optionA: check.data.optionA,
                    optionB: check.data.optionB,
                    optionC: check.data.optionC,
                    optionD: check.data.optionD,
                    optionE: check.data.optionE,
                    correctOptions: check.data.correctOption,
                    explanation: check.data.explanation,
                    answerImage: check.data.answerImage,
                    tableData: check.data.tableData,
                    caseStudyData: check.data.caseStudyData,
                    blankOptions: check.data.blankOptions,
                    subQuestions: check.data.subQuestions,
                    twoPartAnalysisData: check.data.twoPartAnalysisData,
                    points: check.data.points || 1,
                    quizId: check.data.quizId,
                    orderIndex: check.data.orderIndex || 0,
                    isDeleted: false,
                    sectionId: check.data.sectionId,
                    topicId: check.data.topicId
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "Question created successfully",
                data: question,
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
function updateQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const questionId = req.params.id;
            const check = question_validator_1.UpdateQuestionSchema.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const checkQuestion = yield db_1.prisma.question.findUnique({
                where: { id: questionId, isDeleted: false },
            });
            if (!checkQuestion) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "Question not found",
                });
                return;
            }
            const question = yield db_1.prisma.question.update({
                where: { id: questionId },
                data: {
                    questionText: check.data.questionText,
                    image: check.data.image,
                    questionType: check.data.questionType,
                    questionSection: null,
                    questionTopic: check.data.questionTopic,
                    paragraphText: check.data.paragraphText,
                    optionA: check.data.optionA,
                    optionB: check.data.optionB,
                    optionC: check.data.optionC,
                    optionD: check.data.optionD,
                    optionE: check.data.optionE,
                    correctOptions: check.data.correctOption,
                    explanation: check.data.explanation,
                    answerImage: check.data.answerImage,
                    tableData: check.data.tableData,
                    caseStudyData: check.data.caseStudyData,
                    blankOptions: check.data.blankOptions,
                    subQuestions: check.data.subQuestions,
                    points: check.data.points,
                    orderIndex: check.data.orderIndex,
                    sectionId: check.data.sectionId,
                    topicId: check.data.topicId
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Question updated successfully",
                data: question,
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
function deleteQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const questionId = req.params.id;
            console.log(questionId);
            const checkQuestion = yield db_1.prisma.question.findUnique({
                where: { id: questionId, isDeleted: false },
            });
            console.log(checkQuestion);
            if (!checkQuestion) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Question not found" });
                return;
            }
            yield db_1.prisma.question.update({
                where: { id: questionId },
                data: { isDeleted: true },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Question deleted successfully",
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
// Additional helper function to get questions by category
function getQuestionsByCategory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { quizId, questionCategory } = req.query;
            if (!quizId || !questionCategory) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Quiz ID and question category are required"
                });
                return;
            }
            const questions = yield db_1.prisma.question.findMany({
                where: {
                    quizId: quizId,
                    isDeleted: false,
                },
                orderBy: {
                    orderIndex: 'asc'
                }
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Questions fetched by category successfully",
                data: questions,
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
// Function to reorder questions
function reorderQuestions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { questionOrders } = req.body; // Array of { id: string, orderIndex: number }
            if (!Array.isArray(questionOrders)) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "questionOrders must be an array"
                });
                return;
            }
            // Update order index for multiple questions
            const updatePromises = questionOrders.map((item) => db_1.prisma.question.update({
                where: { id: item.id },
                data: { orderIndex: item.orderIndex }
            }));
            yield Promise.all(updatePromises);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Questions reordered successfully",
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
