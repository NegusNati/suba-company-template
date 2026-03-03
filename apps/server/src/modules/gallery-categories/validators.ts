import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const galleryCategorySortFields = ["createdAt", "name"] as const;
export type GalleryCategorySortField =
  (typeof galleryCategorySortFields)[number];

const galleryCategorySortSchema = sortSchema.extend({
  sortBy: z.enum(galleryCategorySortFields).optional(),
});

export const createGalleryCategorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
});

export const updateGalleryCategorySchema = buildUpdateSchema(
  createGalleryCategorySchema,
  ["slug"],
);

export const galleryCategoryQuerySchema = paginationSchema
  .merge(galleryCategorySortSchema)
  .merge(searchSchema);

export const publicGalleryCategoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().optional(),
  sortBy: z.enum(galleryCategorySortFields).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const galleryCategoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateGalleryCategoryInput = z.infer<
  typeof createGalleryCategorySchema
>;
export type UpdateGalleryCategoryInput = z.infer<
  typeof updateGalleryCategorySchema
>;
export type GalleryCategoryQuery = z.infer<typeof galleryCategoryQuerySchema>;
export type PublicGalleryCategoryQuery = z.infer<
  typeof publicGalleryCategoryQuerySchema
>;
export type GalleryCategoryIdParams = z.infer<
  typeof galleryCategoryIdParamSchema
>;
