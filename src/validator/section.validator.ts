import z from "zod";

export const sectionValidator = z.object({
  name: z.string(),
});
