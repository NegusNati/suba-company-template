import { z } from "zod";

export const faqResponseSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicFaqResponseSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
});

export type FaqResponse = z.infer<typeof faqResponseSchema>;
export type PublicFaqResponse = z.infer<typeof publicFaqResponseSchema>;
