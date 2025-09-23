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
exports.getAllQuiz_section = getAllQuiz_section;
exports.getQuiz_section = getQuiz_section;
exports.createQuiz_section = createQuiz_section;
exports.updateQuiz_section = updateQuiz_section;
exports.deleteQuiz_section = deleteQuiz_section;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const quiz_section_validator_1 = require("../validator/quiz_section.validator");
function getAllQuiz_section(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const quizId = req.query.quizId;
            if (!quizId) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json({ error: "Quiz ID is required" });
                return;
            }
            const quizSections = yield db_1.prisma.quizSection.findMany({
                where: { quizId: quizId, isDeleted: false },
                include: {
                    questions: true,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz sections fetched successfully",
                data: quizSections,
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
function getQuiz_section(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const quizSections = yield db_1.prisma.quizSection.findMany({
                where: {
                    quizId: id,
                    isDeleted: false,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "quiz sections",
                data: quizSections,
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
function createQuiz_section(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = quiz_section_validator_1.QuizSectionValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const quizSection = yield db_1.prisma.quizSection.create({
                data: {
                    name: check.data.name,
                    quizId: check.data.quizId,
                    isCalculatorAllowed: check.data.isCalculatorAllowed,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "Quiz section created successfully",
                data: quizSection,
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
function updateQuiz_section(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const sectionId = req.params.id;
            const check = quiz_section_validator_1.UpdateQuizSectionValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const updatedSection = yield db_1.prisma.quizSection.update({
                where: { id: sectionId },
                data: {
                    name: check.data.name,
                    isCalculatorAllowed: check.data.isCalculatorAllowed,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz section updated successfully",
                data: updatedSection,
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
function deleteQuiz_section(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sectionId = req.params.id;
            const existingSection = yield db_1.prisma.quizSection.findUnique({
                where: { id: sectionId },
            });
            if (!existingSection) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "Quiz section not found",
                });
                return;
            }
            yield db_1.prisma.quizSection.update({
                where: { id: sectionId },
                data: {
                    isDeleted: true,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Quiz section deleted successfully",
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
