import z from "zod";

export const QuizSectionValidator = z.object({
  name: z.string(),
  quizId: z.string().cuid(),
});
