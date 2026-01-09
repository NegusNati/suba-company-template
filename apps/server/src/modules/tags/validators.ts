import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const tagSortFields = ["createdAt", "name"] as const;
export type TagSortField = (typeof tagSortFields)[number];
const tagSortSchema = sortSchema.extend({
  sortBy: z.enum(tagSortFields).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
});

export const updateTagSchema = buildUpdateSchema(createTagSchema, ["slug"]);

export const tagQuerySchema = paginationSchema
  .merge(tagSortSchema)
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(["createdAt", "name"]).optional(),
  });

export const publicTagQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  sortBy: z.enum(tagSortFields).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const tagIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagQuery = z.infer<typeof tagQuerySchema>;
export type PublicTagQuery = z.infer<typeof publicTagQuerySchema>;
export type TagIdParams = z.infer<typeof tagIdParamSchema>;
