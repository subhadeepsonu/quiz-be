import z from "zod";

export const PlanValidator = z.object({
  name: z.string(),
  price: z.number(),
  duration: z.number().min(1),
  description: z.string(),
});
