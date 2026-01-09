import { z } from "zod";

import { createListParamsSchema, normalizeListParams } from "@/lib/list-params";

export const faqSchema = z.object({
  id: z.number(),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createFaqSchema = faqSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFaqSchema = createFaqSchema.partial();

export type Faq = z.infer<typeof faqSchema>;
export type CreateFaq = z.infer<typeof createFaqSchema>;
export type UpdateFaq = z.infer<typeof updateFaqSchema>;

export const faqsListParamsSchema = createListParamsSchema({
  sortBy: ["createdAt", "question", "updatedAt"] as const,
  defaultSortBy: "createdAt",
});

export type FaqsListParams = z.infer<typeof faqsListParamsSchema>;
export const normalizeFaqsListParams =
  normalizeListParams(faqsListParamsSchema);
