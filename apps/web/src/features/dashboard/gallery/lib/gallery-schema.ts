import { z } from "zod";

// Gallery item from API response
export const galleryItemSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  occurredAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Profile schema for optional image metadata
const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "File size must be less than 10MB",
  )
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type,
      ),
    "File must be a JPEG, PNG, GIF, or WebP image",
  );

// Create gallery item schema
export const createGalleryItemSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional(),
  description: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  image: imageFileSchema,
  imageUrl: z.string().optional(),
});

// Update gallery item schema (all fields optional)
export const updateGalleryItemSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional(),
  description: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  image: imageFileSchema.optional(),
  imageUrl: z.string().optional(),
});

// TypeScript types
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type CreateGalleryItem = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItem = z.infer<typeof updateGalleryItemSchema>;

// List parameters schema for pagination, searching, and filtering
export const galleryListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "occurredAt", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  occurredAtFrom: z.string().datetime().optional(),
  occurredAtTo: z.string().datetime().optional(),
});

export type GalleryListParams = z.infer<typeof galleryListParamsSchema>;

/**
 * Normalizes gallery list parameters to ensure all required fields have defaults
 */
export function normalizeGalleryListParams(
  params: Partial<GalleryListParams>,
): GalleryListParams {
  return galleryListParamsSchema.parse({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
    occurredAtFrom: params.occurredAtFrom,
    occurredAtTo: params.occurredAtTo,
  });
}
