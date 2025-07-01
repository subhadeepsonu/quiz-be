import z from "zod";

export const topicValidator = z.object({
  name: z.string(),
});
