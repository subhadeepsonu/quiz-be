"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuizSectionValidator = exports.QuizSectionValidator = void 0;
const zod_1 = __importDefault(require("zod"));
exports.QuizSectionValidator = zod_1.default.object({
    name: zod_1.default.string(),
    quizId: zod_1.default.string().cuid(),
    isCalculatorAllowed: zod_1.default.boolean().optional().default(false),
});
exports.UpdateQuizSectionValidator = zod_1.default.object({
    name: zod_1.default.string(),
    isCalculatorAllowed: zod_1.default.boolean().optional().default(false),
});
