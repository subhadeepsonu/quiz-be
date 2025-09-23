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
exports.getAllTopic = getAllTopic;
exports.createTopic = createTopic;
exports.updateTopic = updateTopic;
exports.deleteTopic = deleteTopic;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const topic_validator_1 = require("../validator/topic.validator");
function getAllTopic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topics = yield db_1.prisma.topic.findMany({
                where: {
                    isDeleted: false,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Topics fetched successfully",
                data: topics,
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
function createTopic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = topic_validator_1.topicValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const topic = yield db_1.prisma.topic.create({
                data: {
                    name: check.data.name,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "Topic created successfully",
                data: topic,
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
function updateTopic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const topicId = req.params.id;
            const check = topic_validator_1.topicValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const existingTopic = yield db_1.prisma.topic.findUnique({
                where: { id: topicId, isDeleted: false },
            });
            if (!existingTopic) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "Topic not found",
                });
                return;
            }
            const updatedTopic = yield db_1.prisma.topic.update({
                where: { id: topicId },
                data: {
                    name: check.data.name,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Topic updated successfully",
                data: updatedTopic,
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
function deleteTopic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topicId = req.params.id;
            const topic = yield db_1.prisma.topic.findUnique({
                where: { id: topicId, isDeleted: false },
            });
            if (!topic) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Topic not found" });
                return;
            }
            yield db_1.prisma.topic.update({
                where: { id: topicId },
                data: { isDeleted: true },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Topic deleted successfully",
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
