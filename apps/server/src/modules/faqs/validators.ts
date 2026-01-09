import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

export const faqSortFields = ["createdAt", "question"] as const;
export type FaqSortField = (typeof faqSortFields)[number];
const faqSortSchema = sortSchema.extend({
  sortBy: z.enum(faqSortFields).optional(),
});

export const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const updateFaqSchema = buildUpdateSchema(createFaqSchema);

export const faqQuerySchema = paginationSchema
  .merge(faqSortSchema)
  .merge(searchSchema)
  .extend({
    isActive: z.coerce.boolean().optional(),
  });

export const publicFaqQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  sortBy: z.enum(faqSortFields).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const faqIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type FaqQuery = z.infer<typeof faqQuerySchema>;
export type PublicFaqQuery = z.infer<typeof publicFaqQuerySchema>;
export type FaqIdParams = z.infer<typeof faqIdParamSchema>;
