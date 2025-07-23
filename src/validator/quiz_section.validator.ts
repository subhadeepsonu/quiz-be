import z from "zod";

export const QuizSectionValidator = z.object({
  name: z.string(),
  quizId: z.string().cuid(),
  isCalculatorAllowed: z.boolean().optional().default(false),
});

export const UpdateQuizSectionValidator = z.object({
  name: z.string(),
  isCalculatorAllowed: z.boolean().optional().default(false),
});
