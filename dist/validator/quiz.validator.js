"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizValidator = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
exports.QuizValidator = zod_1.default
    .object({
    title: zod_1.default.string().min(1, "Title is required"),
    description: zod_1.default.string().optional(),
    category: zod_1.default.nativeEnum(client_1.TestCategory),
    subCategory: zod_1.default.nativeEnum(client_1.TestSubCategory).optional(),
    duration: zod_1.default.coerce.number().int().positive("Duration must be a positive number"),
    totalQuestions: zod_1.default.coerce.number().int().min(0, "Total questions cannot be negative").optional(),
})
    .superRefine((data, ctx) => {
    if (data.category === "quantitative" && data.subCategory) {
        const validQuantSubCategories = ["topicWise", "sectional"];
        if (!validQuantSubCategories.includes(data.subCategory)) {
            ctx.addIssue({
                path: ["subCategory"],
                code: zod_1.default.ZodIssueCode.custom,
                message: "Invalid subcategory for quantitative tests",
            });
        }
    }
    if (data.category === "verbal" && data.subCategory) {
        const validVerbalSubCategories = [
            "readingComprehension", "criticalReasoning", "rcTopicWise",
            "rcLongSittings", "crTopicWise", "crLongSittings",
            "crActLongSittings", "verbalSectional"
        ];
        if (!validVerbalSubCategories.includes(data.subCategory)) {
            ctx.addIssue({
                path: ["subCategory"],
                code: zod_1.default.ZodIssueCode.custom,
                message: "Invalid subcategory for verbal tests",
            });
        }
    }
    if (data.category === "dataInsights" && data.subCategory) {
        const validDataInsightsSubCategories = [
            "integratedReasoning", "dataSufficiency", "irTopicWise",
            "irSectional", "dsSectional", "dataInsightsSectional"
        ];
        if (!validDataInsightsSubCategories.includes(data.subCategory)) {
            ctx.addIssue({
                path: ["subCategory"],
                code: zod_1.default.ZodIssueCode.custom,
                message: "Invalid subcategory for data insights tests",
            });
        }
    }
    if (data.category === "mockTests" && data.subCategory) {
        ctx.addIssue({
            path: ["subCategory"],
            code: zod_1.default.ZodIssueCode.custom,
            message: "Mock tests should not have subcategories",
        });
    }
});
