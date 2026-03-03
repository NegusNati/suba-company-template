import { z } from "zod";

export const publicGalleryCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  itemCount: z.number().int().nonnegative().optional(),
});

export const publicGalleryCategoryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(100),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "name"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const publicGalleryItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  occurredAt: z.string().nullable(),
  imageUrls: z.array(z.string()).min(1),
  coverImageUrl: z.string().nullable().optional(),
  imageCount: z.number().int().positive().optional(),
  category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
});

export const publicGalleryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(60),
  search: z.string().trim().optional(),
  sortBy: z.enum(["occurredAt", "createdAt"]).default("occurredAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  categorySlug: z.string().trim().optional(),
});

export type PublicGalleryCategory = z.infer<typeof publicGalleryCategorySchema>;
export type PublicGalleryItem = z.infer<typeof publicGalleryItemSchema>;
export type PublicGalleryCategoryParams = z.infer<
  typeof publicGalleryCategoryParamsSchema
>;
export type PublicGalleryParams = z.infer<typeof publicGalleryParamsSchema>;

export const normalizePublicGalleryCategoryParams = (
  params?: Partial<PublicGalleryCategoryParams>,
): PublicGalleryCategoryParams =>
  publicGalleryCategoryParamsSchema.parse({
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  });

export const normalizePublicGalleryParams = (
  params?: Partial<PublicGalleryParams>,
): PublicGalleryParams =>
  publicGalleryParamsSchema.parse({
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    categorySlug: params?.categorySlug || undefined,
  });
