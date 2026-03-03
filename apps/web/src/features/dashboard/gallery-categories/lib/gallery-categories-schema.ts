import { z } from "zod";

import { createListParamsSchema, normalizeListParams } from "@/lib/list-params";

export const galleryCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string(),
  isSystem: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createGalleryCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
});

export type GalleryCategory = z.infer<typeof galleryCategorySchema>;
export type CreateGalleryCategory = z.infer<typeof createGalleryCategorySchema>;

export const galleryCategoriesListParamsSchema = createListParamsSchema({
  sortBy: ["createdAt", "name"] as const,
  defaultSortBy: "createdAt",
});

export type GalleryCategoriesListParams = z.infer<
  typeof galleryCategoriesListParamsSchema
>;

export const normalizeGalleryCategoriesListParams = normalizeListParams(
  galleryCategoriesListParamsSchema,
);
