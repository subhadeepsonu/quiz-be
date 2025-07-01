import { QuizType } from "@prisma/client";
import z from "zod";

export const QuizValidator = z
  .object({
    type: z.nativeEnum(QuizType),
    topicId: z.string().cuid().optional(),
    sectionId: z.string().cuid().optional(),
    title: z.string().min(1),
    duration: z.coerce.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "topicWise" && !data.topicId) {
      ctx.addIssue({
        path: ["topicId"],
        code: z.ZodIssueCode.custom,
        message: "Topic ID is required for topic-wise quizzes",
      });
    }
    if (data.type === "sectionWise" && !data.sectionId) {
      ctx.addIssue({
        path: ["sectionId"],
        code: z.ZodIssueCode.custom,
        message: "Section ID is required for section-wise quizzes",
      });
    }
  });
