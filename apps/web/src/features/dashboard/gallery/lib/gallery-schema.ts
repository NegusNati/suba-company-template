import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { createListParamsSchema, normalizeListParams } from "@/lib/list-params";

export const galleryCategorySummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const galleryItemSchema = z.object({
  id: z.number(),
  imageUrls: z.array(z.string()),
  coverImageUrl: z.string().nullable().optional(),
  imageCount: z.number().int().nonnegative().optional(),
  title: z.string(),
  description: z.string().nullable(),
  occurredAt: z.string().nullable(),
  category: galleryCategorySummarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const galleryImageWithFileSchema = z.object({
  imageUrl: z.string().optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        IMAGE_MIME_TYPES.includes(
          file.type as (typeof IMAGE_MIME_TYPES)[number],
        ),
      "File must be a supported image type",
    )
    .optional(),
  previewUrl: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const createGalleryItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  categoryId: z.number().int().positive("Category is required"),
  images: z
    .array(galleryImageWithFileSchema)
    .min(1, "At least one image is required"),
});

export const updateGalleryItemSchema = createGalleryItemSchema
  .partial()
  .extend({
    title: z.string().min(1, "Title is required").max(255).optional(),
    categoryId: z.number().int().positive().optional(),
    images: z.array(galleryImageWithFileSchema).min(1).optional(),
  });

export type GalleryCategorySummary = z.infer<
  typeof galleryCategorySummarySchema
>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type GalleryImageWithFile = z.infer<typeof galleryImageWithFileSchema>;
export type CreateGalleryItem = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItem = z.infer<typeof updateGalleryItemSchema>;

export const galleryListParamsSchema = createListParamsSchema({
  sortBy: ["createdAt", "occurredAt", "title"] as const,
  defaultSortBy: "createdAt",
  extra: {
    occurredAtFrom: z.string().datetime().optional(),
    occurredAtTo: z.string().datetime().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  },
});

export type GalleryListParams = z.infer<typeof galleryListParamsSchema>;

export const normalizeGalleryListParams = normalizeListParams(
  galleryListParamsSchema,
);
