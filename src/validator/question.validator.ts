import { QuestionType, QuestionCategory, SectionEnum, TopicEnum } from "@prisma/client";
import { z } from "zod";

export const QuestionTypeEnum = z.nativeEnum(QuestionType);
export const QuestionCategoryEnum = z.nativeEnum(QuestionCategory);
export const SectionEnumSchema = z.nativeEnum(SectionEnum);
export const TopicEnumSchema = z.nativeEnum(TopicEnum);
const CorrectOptionEnum = z.enum(["A", "B", "C", "D", "E"]);

// Schema for blank options (fill-in-blank questions)
const BlankOptionSchema = z.object({
  options: z.array(z.string()).min(1, "At least one option is required"),
  correct: z.string().min(1, "Correct answer is required"),
});

const CaseStudySectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
});

const CaseStudyQuestionSchema = z.object({
  question: z.string().min(1, "Case study question text is required"),
  type: z.enum(["singleCorrect", "multipleCorrect", "Boolean", "multiBoolean"]),
  options: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  correctOption: z.array(CorrectOptionEnum).optional(),
  booleanAnswer: z.boolean().optional(),

  subQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        optionALabel: z.string().min(1),
        optionBLabel: z.string().min(1),
        correct: z.enum(["A", "B"]),
      })
    )
    .optional(),
});

const CaseStudyDataSchema = z.object({
  sections: z.array(CaseStudySectionSchema).min(1),
  questions: z.array(CaseStudyQuestionSchema).min(1),
});

// Schema for table data
const TableDataSchema = z.object({
  columns: z.array(z.string()).min(1, "At least one column is required"),
  rows: z.array(z.array(z.string())).min(1, "At least one row is required"),
});

// Schema for sub-questions (image multi-boolean questions)
const SubQuestionSchema = z.object({
  question: z.string().min(1, "Sub-question text is required"),
  optionALabel: z.string().min(1, "Option A label is required"),
  optionBLabel: z.string().min(1, "Option B label is required"),
  correct: z.enum(["A", "B"]),
});

export const QuestionSchema = z
  .object({

    questionText: z.string().min(1, "Question text is required"),
    image: z.string().optional(),
    questionType: QuestionTypeEnum,
    questionCategory: QuestionCategoryEnum,

    questionSection: SectionEnumSchema.optional(),
    questionTopic: TopicEnumSchema.optional(),
    twoPartAnalysisData: z.object({
      correctPart1Option: z.number(),
      correctPart2Option: z.number(),
      options: z.array(z.string())
    }).optional(),
    paragraphText: z.string().optional(),
    optionA: z.string().optional(),
    optionB: z.string().optional(),
    optionC: z.string().optional(),
    optionD: z.string().optional(),
    optionE: z.string().optional(),
    sectionId: z.string().optional(),
    topicId: z.string().optional(),
    correctOption: z.array(CorrectOptionEnum).optional(),
    explanation: z.string().optional(),
    answerImage: z.string().optional(),
    tableData: TableDataSchema.optional(),
    caseStudyData: CaseStudyDataSchema.optional(),
    blankOptions: z.record(z.string(), BlankOptionSchema).optional(),
    subQuestions: z.array(SubQuestionSchema).optional(),
    tags: z.array(z.string()).default([]),
    points: z.number().int().positive().default(1),
    quizId: z.string().cuid("Invalid quiz ID format"),
    orderIndex: z.number().int().min(0).default(0),

    // Boolean answer for Boolean type questions
    booleanAnswer: z.boolean().optional(),

    // Quiz category for validation context
    quizCategory: z.enum(["QUANTITATIVE", "VERBAL", "DATA_INSIGHTS", "MOCK_TESTS"]).optional(),
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
          code: z.ZodIssueCode.custom,
          message: "Case study data is required for caseStudy questions.",
          path: ["caseStudyData"],
        });
      }
    }

    // Boolean question validation
    if (isBoolean) {
      if (data.booleanAnswer === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Boolean answer is required for Boolean type questions.",
          path: ["booleanAnswer"],
        });
      }

      // Boolean questions shouldn't have standard options
      const hasOptions =
        data.optionA ||
        data.optionB ||
        data.optionC ||
        data.optionD ||
        data.optionE;
      if (hasOptions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Options A–E should not be provided for Boolean questions.",
          path: [],
        });
      }

      if (data.correctOption && data.correctOption.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Use 'booleanAnswer' instead of 'correctOption' for Boolean questions.",
          path: ["correctOption"],
        });
      }
    }

    // Fill-in-blank question validation
    if (isFillInBlank) {
      if (!data.paragraphText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Paragraph text is required for fill-in-blank questions.",
          path: ["paragraphText"],
        });
      }

      if (!data.blankOptions || Object.keys(data.blankOptions).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
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
        const missingOptions = placeholders.filter(
          (placeholder) => !blankIds.includes(placeholder)
        );
        if (missingOptions.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Missing blank options for placeholders: ${missingOptions.join(
              ", "
            )}`,
            path: ["blankOptions"],
          });
        }

        // Check if all blank options have corresponding placeholders
        const unusedOptions = blankIds.filter(
          (blankId) => !placeholders.includes(blankId)
        );
        if (unusedOptions.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unused blank options (no matching placeholders): ${unusedOptions.join(
              ", "
            )}`,
            path: ["blankOptions"],
          });
        }
      }

      // Fill-in-blank shouldn't have standard options
      const hasOptions =
        data.optionA ||
        data.optionB ||
        data.optionC ||
        data.optionD ||
        data.optionE;
      if (hasOptions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Options A–E should not be provided for fill-in-blank questions.",
          path: [],
        });
      }
    }

    // Table question validation
    if (isTableWithOptions) {
      if (!data.tableData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Table data is required for table questions.",
          path: ["tableData"],
        });
      } else {
        // Validate table structure
        if (!data.tableData.columns || data.tableData.columns.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least one column is required for table questions.",
            path: ["tableData", "columns"],
          });
        }

        if (!data.tableData.rows || data.tableData.rows.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
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
                code: z.ZodIssueCode.custom,
                message: `Row ${index + 1} has ${row.length
                  } cells but table has ${columnCount} columns.`,
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
          code: z.ZodIssueCode.custom,
          message: "Image is required for image multi-boolean questions.",
          path: ["image"],
        });
      }

      if (!data.subQuestions || data.subQuestions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Sub-questions are required for image multi-boolean questions.",
          path: ["subQuestions"],
        });
      }

      // Image multi-boolean shouldn't have standard options
      const hasOptions =
        data.optionA ||
        data.optionB ||
        data.optionC ||
        data.optionD ||
        data.optionE;
      if (hasOptions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Options A–E should not be provided for image multi-boolean questions.",
          path: [],
        });
      }
    }

    // Standard option-based question validation
    if (needsStandardOptions) {
      // Paragraph questions need paragraphText
      if (isParagraph && !data.paragraphText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
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
      ].filter((opt) => !data[opt as keyof typeof data]);

      if (missingOptions.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Options A–E are required for ${data.questionType} questions.`,
          path: [],
        });
      }

      // Validate correctOption
      if (!data.correctOption || data.correctOption.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one correct option is required.",
          path: ["correctOption"],
        });
      }

      // Single correct validation
      if (
        isSingleCorrect &&
        data.correctOption &&
        data.correctOption.length !== 1
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Exactly one correct option is required for single correct/paragraph questions.",
          path: ["correctOption"],
        });
      }

      // Multiple correct validation
      if (
        isMultipleCorrect &&
        data.correctOption &&
        data.correctOption.length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least two correct options are required for multiple correct questions.",
          path: ["correctOption"],
        });
      }

      // Validate that correctOption values exist in the options
      if (data.correctOption && data.correctOption.length > 0) {
        const availableOptions = ["A", "B", "C", "D", "E"].filter(
          (opt) => data[`option${opt}` as keyof typeof data]
        );

        const invalidOptions = data.correctOption.filter(
          (opt) => !availableOptions.includes(opt)
        );
        if (invalidOptions.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Correct options reference non-existent options: ${invalidOptions.join(
              ", "
            )}`,
            path: ["correctOption"],
          });
        }
      }
    }

    // Validation for non-standard questions - they shouldn't have booleanAnswer
    if (!isBoolean && data.booleanAnswer !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Boolean answer is only valid for Boolean type questions.",
        path: ["booleanAnswer"],
      });
    }

    // Clean up validation - ensure question types don't have irrelevant data
    if (!isFillInBlank && data.blankOptions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Blank options should only be provided for fill-in-blank questions.",
        path: ["blankOptions"],
      });
    }

    if (!isTableWithOptions && data.tableData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Table data should only be provided for table questions.",
        path: ["tableData"],
      });
    }

    if (!isImageMultiBoolean && data.subQuestions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Sub-questions should only be provided for image multi-boolean questions.",
        path: ["subQuestions"],
      });
    }
  });

// Create schema variant for updates (makes more fields optional)
export const UpdateQuestionSchema = QuestionSchema

// Export the schema type for TypeScript
export type QuestionSchemaType = z.infer<typeof QuestionSchema>;
export type UpdateQuestionSchemaType = z.infer<typeof UpdateQuestionSchema>;

// Utility function to validate question data
export const validateQuestion = (data: unknown) => {
  return QuestionSchema.safeParse(data);
};

// Utility function to validate question update data
export const validateUpdateQuestion = (data: unknown) => {
  return UpdateQuestionSchema.safeParse(data);
};

// Type guards for runtime checking
export const isStandardOptionQuestion = (questionType: string): boolean => {
  return [
    "singleCorrect",
    "multipleCorrect",
    "paragraph",
    "tableWithOptions",
  ].includes(questionType);
};

export const requiresImage = (questionType: string): boolean => {
  return questionType === "imageMultiBoolean";
};

export const requiresParagraphText = (questionType: string): boolean => {
  return ["paragraph", "fillInBlankDropdown"].includes(questionType);
};

export const requiresSpecialData = (questionType: string): boolean => {
  return [
    "fillInBlankDropdown",
    "tableWithOptions",
    "imageMultiBoolean",
    "caseStudy",
  ].includes(questionType);
};


// Helper function to get default question data based on type
export const getDefaultQuestionData = (
  questionType: QuestionType,
  questionCategory: QuestionCategory,
  quizId: string,
  quizCategory?: string
): Partial<QuestionSchemaType> => {
  return {
    questionType,
    questionCategory,
    quizId,
    quizCategory: quizCategory as any,
    tags: [],
    points: 1,
    orderIndex: 0,
  };
};