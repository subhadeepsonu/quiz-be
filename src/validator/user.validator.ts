import z from "zod";

export const updateMeValidator = z.object({
  name: z.string().min(2).max(100),
});

// Validator for user
