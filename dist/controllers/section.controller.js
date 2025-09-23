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
exports.getAllSection = getAllSection;
exports.getSectionById = getSectionById;
exports.createSection = createSection;
exports.updateSection = updateSection;
exports.deleteSection = deleteSection;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const section_validator_1 = require("../validator/section.validator");
function getAllSection(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sections = yield db_1.prisma.section.findMany({
                where: {
                    isDeleted: false,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Sections fetched successfully",
                data: sections,
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
function getSectionById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sectionId = req.params.id;
            const section = yield db_1.prisma.section.findUnique({
                where: { id: sectionId, isDeleted: false },
            });
            if (!section) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Section not found" });
                return;
            }
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Section fetched successfully",
                data: section,
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
function createSection(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = section_validator_1.sectionValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const newSection = yield db_1.prisma.section.create({
                data: {
                    name: check.data.name,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "Section created successfully",
                data: newSection,
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
function updateSection(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const sectionId = req.params.id;
            const check = section_validator_1.sectionValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const existingSection = yield db_1.prisma.section.findUnique({
                where: { id: sectionId, isDeleted: false },
            });
            if (!existingSection) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Section not found" });
                return;
            }
            const updatedSection = yield db_1.prisma.section.update({
                where: { id: sectionId },
                data: {
                    name: check.data.name,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Section updated successfully",
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
function deleteSection(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sectionId = req.params.id;
            const existingSection = yield db_1.prisma.section.findUnique({
                where: { id: sectionId, isDeleted: false },
            });
            if (!existingSection) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Section not found" });
                return;
            }
            yield db_1.prisma.section.update({
                where: { id: sectionId },
                data: { isDeleted: true },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Section deleted successfully",
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
