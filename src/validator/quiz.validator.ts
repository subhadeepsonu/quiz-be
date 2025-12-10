import { TestCategory, TestSubCategory } from "@prisma/client";
import z from "zod";

export const QuizPatchValidator = z.object({

  quizId: z.string(),
  seqNo: z.number()


})

export const QuizValidator = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.nativeEnum(TestCategory),
    subCategory: z.nativeEnum(TestSubCategory).optional(),
    duration: z.coerce.number().int().positive("Duration must be a positive number"),
    totalQuestions: z.coerce.number().int().min(0, "Total questions cannot be negative").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === TestCategory.QUANTITATIVE && data.subCategory) {
      const validQuantSubCategories: TestSubCategory[] = [
        TestSubCategory.TOPIC_WISE,
        TestSubCategory.SECTIONAL,
      ];
      if (!validQuantSubCategories.includes(data.subCategory)) {
        ctx.addIssue({
          path: ["subCategory"],
          code: z.ZodIssueCode.custom,
          message: "Invalid subcategory for quantitative tests",
        });
      }
    }

    if (data.category === TestCategory.VERBAL && data.subCategory) {
      const validVerbalSubCategories: TestSubCategory[] = [
        TestSubCategory.RC_TOPIC,
        TestSubCategory.RC_LONG,
        TestSubCategory.CR_TOPIC,
        TestSubCategory.CR_LONG,
        TestSubCategory.CR_ACT,
        TestSubCategory.SECTIONAL,
      ];
      if (!validVerbalSubCategories.includes(data.subCategory)) {
        ctx.addIssue({
          path: ["subCategory"],
          code: z.ZodIssueCode.custom,
          message: "Invalid subcategory for verbal tests",
        });
      }
    }

    if (data.category === TestCategory.DATA_INSIGHTS && data.subCategory) {
      const validDataInsightsSubCategories: TestSubCategory[] = [
        TestSubCategory.IR_TOPIC,
        TestSubCategory.IR_SECTIONAL,
        TestSubCategory.DS,
        TestSubCategory.SECTIONAL,
      ];
      if (!validDataInsightsSubCategories.includes(data.subCategory)) {
        ctx.addIssue({
          path: ["subCategory"],
          code: z.ZodIssueCode.custom,
          message: "Invalid subcategory for data insights tests",
        });
      }
    }
  });
