import z from "zod";

export const registerValidator = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
