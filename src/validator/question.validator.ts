import { z } from "zod";

export const QuestionTypeEnum = z.enum([
  "singleCorrect",
  "multipleCorrect",
  "Boolean",
]);
const CorrectOptionEnum = z.enum(["A", "B", "C", "D"]);

export const QuestionSchema = z
  .object({
    id: z.string().cuid().optional(),
    image: z.string().url().optional(),
    questionType: QuestionTypeEnum,
    question: z.string().min(1, "Question is required"),
    optionA: z.string().optional(),
    optionB: z.string().optional(),
    optionC: z.string().optional(),
    optionD: z.string().optional(),
    correctOption: z.array(CorrectOptionEnum).optional(),
    booleanAnswer: z.boolean().optional(),
    quizSectionId: z.string().cuid(),
  })
  .superRefine((data, ctx) => {
    if (data.questionType === "Boolean") {
      if (data.booleanAnswer === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Boolean answer is required for Boolean type questions.",
          path: ["booleanAnswer"],
        });
      }
      const hasOptions =
        data.optionA || data.optionB || data.optionC || data.optionD;
      if (hasOptions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Options A–D should not be provided for Boolean questions.",
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
    } else {
      if (!data.correctOption || data.correctOption.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one correct option is required.",
          path: ["correctOption"],
        });
      }

      if (
        data.questionType === "singleCorrect" &&
        data.correctOption?.length !== 1
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Only one correct option is allowed for singleCorrect questions.",
          path: ["correctOption"],
        });
      }
      if (data.booleanAnswer !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Boolean answer is only valid for Boolean type questions.",
          path: ["booleanAnswer"],
        });
      }

      // Require all options
      const missingOptions = [
        "optionA",
        "optionB",
        "optionC",
        "optionD",
      ].filter((opt) => !data[opt as keyof typeof data]);
      if (missingOptions.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Options A–D are required for single/multiple correct questions.",
          path: [],
        });
      }
    }
  });
