"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizValidator = exports.QuizPatchValidator = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
exports.QuizPatchValidator = zod_1.default.object({
    quizId: zod_1.default.string(),
    seqNo: zod_1.default.number()
});
exports.QuizValidator = zod_1.default
    .object({
    title: zod_1.default.string().min(1, "Title is required"),
    description: zod_1.default.string().optional(),
    category: zod_1.default.nativeEnum(client_1.TestCategory),
    subCategory: zod_1.default.nativeEnum(client_1.TestSubCategory).optional(),
    duration: zod_1.default.coerce.number().int().positive("Duration must be a positive number"),
    totalQuestions: zod_1.default.coerce.number().int().min(0, "Total questions cannot be negative").optional(),
    seqNo: zod_1.default.number().optional(),
})
    .superRefine((data, ctx) => {
    if (data.category === client_1.TestCategory.QUANTITATIVE && data.subCategory) {
        const validQuantSubCategories = [
            client_1.TestSubCategory.TOPIC_WISE,
            client_1.TestSubCategory.SECTIONAL,
        ];
        if (!validQuantSubCategories.includes(data.subCategory)) {
            ctx.addIssue({
                path: ["subCategory"],
                code: zod_1.default.ZodIssueCode.custom,
                message: "Invalid subcategory for quantitative tests",
            });
        }
    }
    if (data.category === client_1.TestCategory.VERBAL && data.subCategory) {
        const validVerbalSubCategories = [
            client_1.TestSubCategory.RC_TOPIC,
            client_1.TestSubCategory.RC_LONG,
            client_1.TestSubCategory.CR_TOPIC,
            client_1.TestSubCategory.CR_LONG,
            client_1.TestSubCategory.CR_ACT,
            client_1.TestSubCategory.SECTIONAL,
        ];
        if (!validVerbalSubCategories.includes(data.subCategory)) {
            ctx.addIssue({
                path: ["subCategory"],
                code: zod_1.default.ZodIssueCode.custom,
                message: "Invalid subcategory for verbal tests",
            });
        }
    }
    if (data.category === client_1.TestCategory.DATA_INSIGHTS && data.subCategory) {
        const validDataInsightsSubCategories = [
            client_1.TestSubCategory.IR_TOPIC,
            client_1.TestSubCategory.IR_SECTIONAL,
            client_1.TestSubCategory.DS,
            client_1.TestSubCategory.SECTIONAL,
        ];
        if (!validDataInsightsSubCategories.includes(data.subCategory)) {
            ctx.addIssue({
                path: ["subCategory"],
                code: zod_1.default.ZodIssueCode.custom,
                message: "Invalid subcategory for data insights tests",
            });
        }
    }
});
