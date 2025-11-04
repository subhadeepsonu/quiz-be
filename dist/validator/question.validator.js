"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultQuestionData = exports.requiresSpecialData = exports.requiresParagraphText = exports.requiresImage = exports.isStandardOptionQuestion = exports.validateUpdateQuestion = exports.validateQuestion = exports.UpdateQuestionSchema = exports.QuestionSchema = exports.TopicEnumSchema = exports.SectionEnumSchema = exports.QuestionCategoryEnum = exports.QuestionTypeEnum = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.QuestionTypeEnum = zod_1.z.nativeEnum(client_1.QuestionType);
exports.QuestionCategoryEnum = zod_1.z.nativeEnum(client_1.QuestionCategory);
exports.SectionEnumSchema = zod_1.z.nativeEnum(client_1.SectionEnum);
exports.TopicEnumSchema = zod_1.z.nativeEnum(client_1.TopicEnum);
const CorrectOptionEnum = zod_1.z.enum(["A", "B", "C", "D", "E"]);
// Schema for blank options (fill-in-blank questions)
const BlankOptionSchema = zod_1.z.object({
    options: zod_1.z.array(zod_1.z.string()).min(1, "At least one option is required"),
    correct: zod_1.z.string().min(1, "Correct answer is required"),
});
const CaseStudySectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Section title is required"),
    content: zod_1.z.string().min(1, "Section content is required"),
});
const CaseStudyQuestionSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Case study question text is required"),
    type: zod_1.z.enum(["singleCorrect", "multipleCorrect", "Boolean", "multiBoolean"]),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    imageUrl: zod_1.z.string().optional(),
    correctOption: zod_1.z.array(CorrectOptionEnum).optional(),
    booleanAnswer: zod_1.z.boolean().optional(),
    subQuestions: zod_1.z
        .array(zod_1.z.object({
        question: zod_1.z.string().min(1),
        optionALabel: zod_1.z.string().min(1),
        optionBLabel: zod_1.z.string().min(1),
        correct: zod_1.z.enum(["A", "B"]),
    }))
        .optional(),
});
const CaseStudyDataSchema = zod_1.z.object({
    sections: zod_1.z.array(CaseStudySectionSchema).min(1),
    questions: zod_1.z.array(CaseStudyQuestionSchema).min(1),
});
// Schema for table data
const TableDataSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.string()).min(1, "At least one column is required"),
    rows: zod_1.z.array(zod_1.z.array(zod_1.z.string())).min(1, "At least one row is required"),
});
// Schema for sub-questions (image multi-boolean questions)
const SubQuestionSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Sub-question text is required"),
    optionALabel: zod_1.z.string().min(1, "Option A label is required"),
    optionBLabel: zod_1.z.string().min(1, "Option B label is required"),
    correct: zod_1.z.enum(["A", "B"]),
});
exports.QuestionSchema = zod_1.z
    .object({
    questionText: zod_1.z.string().min(1, "Question text is required"),
    image: zod_1.z.string().optional(),
    questionType: exports.QuestionTypeEnum,
    questionCategory: exports.QuestionCategoryEnum,
    questionSection: exports.SectionEnumSchema.optional(),
    questionTopic: exports.TopicEnumSchema.optional(),
    twoPartAnalysisData: zod_1.z.object({
        correctPart1Option: zod_1.z.number(),
        correctPart2Option: zod_1.z.number(),
        options: zod_1.z.array(zod_1.z.string())
    }).optional(),
    paragraphText: zod_1.z.string().optional(),
    optionA: zod_1.z.string().optional(),
    optionB: zod_1.z.string().optional(),
    optionC: zod_1.z.string().optional(),
    optionD: zod_1.z.string().optional(),
    optionE: zod_1.z.string().optional(),
    sectionId: zod_1.z.string().optional(),
    topicId: zod_1.z.string().optional(),
    correctOption: zod_1.z.array(CorrectOptionEnum).optional(),
    explanation: zod_1.z.string().optional(),
    answerImage: zod_1.z.string().optional(),
    tableData: TableDataSchema.optional(),
    caseStudyData: CaseStudyDataSchema.optional(),
    blankOptions: zod_1.z.record(zod_1.z.string(), BlankOptionSchema).optional(),
    subQuestions: zod_1.z.array(SubQuestionSchema).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    points: zod_1.z.number().int().positive().default(1),
    quizId: zod_1.z.string().cuid("Invalid quiz ID format"),
    orderIndex: zod_1.z.number().int().min(0).default(0),
    // Boolean answer for Boolean type questions
    booleanAnswer: zod_1.z.boolean().optional(),
    // Quiz category for validation context
    quizCategory: zod_1.z.enum(["QUANTITATIVE", "VERBAL", "DATA_INSIGHTS", "MOCK_TESTS"]).optional(),
})
    .superRefine((data, ctx) => {
    const isParagraph = data.questionType === "paragraph";
    const isCaseStudy = data.questionType === "caseStudy";
    const isBoolean = data.questionType === "Boolean";
    const isSingleCorrect = data.questionType === "singleCorrect" || isParagraph;
    const isMultipleCorrect = data.questionType === "multipleCorrect";
    const isFillInBlank = data.questionType === "fillInBlankDropdown";
    const isTableWithOptions = data.questionType === "tableWithOptions";
    const isImageMultiBoolean = data.questionType === "imageMultiBoolean";
    // Standard option-based questions that need A-E options
    const needsStandardOptions = [
        "singleCorrect",
        "multipleCorrect",
        "paragraph",
        "tableWithOptions",
    ].includes(data.questionType);
    if (isCaseStudy) {
        if (!data.caseStudyData) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Case study data is required for caseStudy questions.",
                path: ["caseStudyData"],
            });
        }
    }
    // Boolean question validation
    if (isBoolean) {
        if (data.booleanAnswer === undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Boolean answer is required for Boolean type questions.",
                path: ["booleanAnswer"],
            });
        }
        // Boolean questions shouldn't have standard options
        const hasOptions = data.optionA ||
            data.optionB ||
            data.optionC ||
            data.optionD ||
            data.optionE;
        if (hasOptions) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Options A–E should not be provided for Boolean questions.",
                path: [],
            });
        }
        if (data.correctOption && data.correctOption.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Use 'booleanAnswer' instead of 'correctOption' for Boolean questions.",
                path: ["correctOption"],
            });
        }
    }
    // Fill-in-blank question validation
    if (isFillInBlank) {
        if (!data.paragraphText) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Paragraph text is required for fill-in-blank questions.",
                path: ["paragraphText"],
            });
        }
        if (!data.blankOptions || Object.keys(data.blankOptions).length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Blank options are required for fill-in-blank questions.",
                path: ["blankOptions"],
            });
        }
        // Validate that blank IDs in blankOptions match placeholders in paragraphText
        if (data.blankOptions && data.paragraphText) {
            const blankIds = Object.keys(data.blankOptions);
            const placeholderPattern = /\{(\w+)\}/g;
            const placeholders = [
                ...data.paragraphText.matchAll(placeholderPattern),
            ].map((match) => match[1]);
            // Check if all placeholders have corresponding blank options
            const missingOptions = placeholders.filter((placeholder) => !blankIds.includes(placeholder));
            if (missingOptions.length > 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `Missing blank options for placeholders: ${missingOptions.join(", ")}`,
                    path: ["blankOptions"],
                });
            }
            // Check if all blank options have corresponding placeholders
            const unusedOptions = blankIds.filter((blankId) => !placeholders.includes(blankId));
            if (unusedOptions.length > 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `Unused blank options (no matching placeholders): ${unusedOptions.join(", ")}`,
                    path: ["blankOptions"],
                });
            }
        }
        // Fill-in-blank shouldn't have standard options
        const hasOptions = data.optionA ||
            data.optionB ||
            data.optionC ||
            data.optionD ||
            data.optionE;
        if (hasOptions) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Options A–E should not be provided for fill-in-blank questions.",
                path: [],
            });
        }
    }
    // Table question validation
    if (isTableWithOptions) {
        if (!data.tableData) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Table data is required for table questions.",
                path: ["tableData"],
            });
        }
        else {
            // Validate table structure
            if (!data.tableData.columns || data.tableData.columns.length === 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "At least one column is required for table questions.",
                    path: ["tableData", "columns"],
                });
            }
            if (!data.tableData.rows || data.tableData.rows.length === 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "At least one row is required for table questions.",
                    path: ["tableData", "rows"],
                });
            }
            // Validate that all rows have the same number of cells as columns
            if (data.tableData.columns && data.tableData.rows) {
                const columnCount = data.tableData.columns.length;
                data.tableData.rows.forEach((row, index) => {
                    if (row.length !== columnCount) {
                        ctx.addIssue({
                            code: zod_1.z.ZodIssueCode.custom,
                            message: `Row ${index + 1} has ${row.length} cells but table has ${columnCount} columns.`,
                            path: ["tableData", "rows", index],
                        });
                    }
                });
            }
        }
    }
    // Image multi-boolean question validation
    if (isImageMultiBoolean) {
        if (!data.image) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Image is required for image multi-boolean questions.",
                path: ["image"],
            });
        }
        if (!data.subQuestions || data.subQuestions.length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Sub-questions are required for image multi-boolean questions.",
                path: ["subQuestions"],
            });
        }
        // Image multi-boolean shouldn't have standard options
        const hasOptions = data.optionA ||
            data.optionB ||
            data.optionC ||
            data.optionD ||
            data.optionE;
        if (hasOptions) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Options A–E should not be provided for image multi-boolean questions.",
                path: [],
            });
        }
    }
    // Standard option-based question validation
    if (needsStandardOptions) {
        // Paragraph questions need paragraphText
        if (isParagraph && !data.paragraphText) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Paragraph text is required for paragraph type questions.",
                path: ["paragraphText"],
            });
        }
        // Check for required options A-E
        const missingOptions = [
            "optionA",
            "optionB",
            "optionC",
            "optionD",
            "optionE",
        ].filter((opt) => !data[opt]);
        if (missingOptions.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Options A–E are required for ${data.questionType} questions.`,
                path: [],
            });
        }
        // Validate correctOption
        if (!data.correctOption || data.correctOption.length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "At least one correct option is required.",
                path: ["correctOption"],
            });
        }
        // Single correct validation
        if (isSingleCorrect &&
            data.correctOption &&
            data.correctOption.length !== 1) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Exactly one correct option is required for single correct/paragraph questions.",
                path: ["correctOption"],
            });
        }
        // Multiple correct validation
        if (isMultipleCorrect &&
            data.correctOption &&
            data.correctOption.length < 2) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "At least two correct options are required for multiple correct questions.",
                path: ["correctOption"],
            });
        }
        // Validate that correctOption values exist in the options
        if (data.correctOption && data.correctOption.length > 0) {
            const availableOptions = ["A", "B", "C", "D", "E"].filter((opt) => data[`option${opt}`]);
            const invalidOptions = data.correctOption.filter((opt) => !availableOptions.includes(opt));
            if (invalidOptions.length > 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `Correct options reference non-existent options: ${invalidOptions.join(", ")}`,
                    path: ["correctOption"],
                });
            }
        }
    }
    // Validation for non-standard questions - they shouldn't have booleanAnswer
    if (!isBoolean && data.booleanAnswer !== undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Boolean answer is only valid for Boolean type questions.",
            path: ["booleanAnswer"],
        });
    }
    // Clean up validation - ensure question types don't have irrelevant data
    if (!isFillInBlank && data.blankOptions) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Blank options should only be provided for fill-in-blank questions.",
            path: ["blankOptions"],
        });
    }
    if (!isTableWithOptions && data.tableData) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Table data should only be provided for table questions.",
            path: ["tableData"],
        });
    }
    if (!isImageMultiBoolean && data.subQuestions) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Sub-questions should only be provided for image multi-boolean questions.",
            path: ["subQuestions"],
        });
    }
});
// Create schema variant for updates (makes more fields optional)
exports.UpdateQuestionSchema = exports.QuestionSchema;
// Utility function to validate question data
const validateQuestion = (data) => {
    return exports.QuestionSchema.safeParse(data);
};
exports.validateQuestion = validateQuestion;
// Utility function to validate question update data
const validateUpdateQuestion = (data) => {
    return exports.UpdateQuestionSchema.safeParse(data);
};
exports.validateUpdateQuestion = validateUpdateQuestion;
// Type guards for runtime checking
const isStandardOptionQuestion = (questionType) => {
    return [
        "singleCorrect",
        "multipleCorrect",
        "paragraph",
        "tableWithOptions",
    ].includes(questionType);
};
exports.isStandardOptionQuestion = isStandardOptionQuestion;
const requiresImage = (questionType) => {
    return questionType === "imageMultiBoolean";
};
exports.requiresImage = requiresImage;
const requiresParagraphText = (questionType) => {
    return ["paragraph", "fillInBlankDropdown"].includes(questionType);
};
exports.requiresParagraphText = requiresParagraphText;
const requiresSpecialData = (questionType) => {
    return [
        "fillInBlankDropdown",
        "tableWithOptions",
        "imageMultiBoolean",
        "caseStudy",
    ].includes(questionType);
};
exports.requiresSpecialData = requiresSpecialData;
// Helper function to get default question data based on type
const getDefaultQuestionData = (questionType, questionCategory, quizId, quizCategory) => {
    return {
        questionType,
        questionCategory,
        quizId,
        quizCategory: quizCategory,
        tags: [],
        points: 1,
        orderIndex: 0,
    };
};
exports.getDefaultQuestionData = getDefaultQuestionData;
