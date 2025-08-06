import { z } from "zod";

export const QuestionTypeEnum = z.enum([
  "singleCorrect",
  "multipleCorrect",
  "Boolean",
  "paragraph",
]);
const CorrectOptionEnum = z.enum(["A", "B", "C", "D", "E"]);

export const QuestionSchema = z
  .object({
    image: z.string().optional(),
    questionType: QuestionTypeEnum,
    question: z.string().min(1, "Question is required"),
    paragraphText: z.string().optional(),
    optionA: z.string().optional(),
    optionB: z.string().optional(),
    optionC: z.string().optional(),
    optionD: z.string().optional(),
    optionE: z.string().optional(),
    correctOption: z.array(CorrectOptionEnum).optional(),
    booleanAnswer: z.boolean().optional(),
    quizSectionId: z.string().cuid(),
    answerImgUrl: z.string().optional(),
    answer: z.string(),
  })
  .superRefine((data, ctx) => {
    const isParagraph = data.questionType === "paragraph";
    const isBoolean = data.questionType === "Boolean";
    const isSingleCorrect =
      data.questionType === "singleCorrect" || isParagraph;
    const isMultipleCorrect = data.questionType === "multipleCorrect";

    if (isBoolean) {
      if (data.booleanAnswer === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Boolean answer is required for Boolean type questions.",
          path: ["booleanAnswer"],
        });
      }

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
    } else {
      // paragraph must have paragraphText
      if (isParagraph && !data.paragraphText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Paragraph text is required for paragraph type questions.",
          path: ["paragraphText"],
        });
      }

      // correctOption required
      if (!data.correctOption || data.correctOption.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one correct option is required.",
          path: ["correctOption"],
        });
      }

      // singleCorrect must have exactly one correct option
      if (isSingleCorrect && data.correctOption?.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Only one correct option is allowed for singleCorrect/paragraph questions.",
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
        "optionE",
      ].filter((opt) => !data[opt as keyof typeof data]);
      if (missingOptions.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Options A–E are required for single/multiple/paragraph questions.",
          path: [],
        });
      }
    }
  });
