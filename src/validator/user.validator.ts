import z from "zod";

export const updateMeValidator = z.object({
  name: z.string().min(2).max(100),
});

export const adminCreateUserValidator = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "editor", "admin"]).default("user"),
    membershipType: z.enum(["DIAGNOSTIC_ONLY", "FREE_TRIAL", "PLAN"]).default("DIAGNOSTIC_ONLY"),
    planId: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.membershipType !== "PLAN" || !!data.planId, {
    message: "Select a subscription plan",
    path: ["planId"],
  });
