import { z } from "zod";

import {
  paginationSchema,
  searchSchema,
  sortSchema,
} from "../../shared/query/parser";

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const gallerySortFields = ["occurredAt", "createdAt", "title"] as const;
export type GallerySortField = (typeof gallerySortFields)[number];
const publicGallerySortFields = ["occurredAt", "createdAt"] as const;

const gallerySortSchema = sortSchema.extend({
  sortBy: z.enum(gallerySortFields).optional(),
});

export const galleryImageMetaSchema = z.object({
  position: z.number().int().min(0),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
});

const parseImagesMeta = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const hasDefinedField = (data: Record<string, unknown>) =>
  Object.values(data).some((value) => value !== undefined);

export const createGalleryItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  categoryId: z.number().int().positive(),
  imageUrls: z
    .array(z.string().refine(urlRefine, urlErrorMessage))
    .min(1, "At least one image is required"),
});

export const updateGalleryItemSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    occurredAt: z.string().datetime().optional(),
    categoryId: z.number().int().positive().optional(),
    imageUrls: z
      .array(z.string().refine(urlRefine, urlErrorMessage))
      .min(1, "At least one image is required")
      .optional(),
  })
  .refine((data) => hasDefinedField(data), {
    message: "At least one field must be provided for update",
  });

export const createGalleryFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z
    .string()
    .nullable()
    .transform((value) => (value === null ? undefined : value))
    .optional(),
  occurredAt: z
    .string()
    .datetime()
    .nullable()
    .transform((value) => (value === null ? undefined : value))
    .optional(),
  categoryId: z.coerce.number().int().positive(),
  imagesMeta: z.preprocess(
    parseImagesMeta,
    z.array(galleryImageMetaSchema).min(1, "At least one image is required"),
  ),
});

export const updateGalleryFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((value) => (value === null ? undefined : value))
      .optional(),
    description: z
      .string()
      .nullable()
      .transform((value) => (value === null ? undefined : value))
      .optional(),
    occurredAt: z
      .string()
      .datetime()
      .nullable()
      .transform((value) => (value === null ? undefined : value))
      .optional(),
    categoryId: z
      .string()
      .nullable()
      .transform((value) => {
        if (value === null || value === undefined || value === "") {
          return undefined;
        }

        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      })
      .refine(
        (value) =>
          value === undefined || (Number.isInteger(value) && value > 0),
        "categoryId must be a positive integer",
      )
      .optional(),
    imagesMeta: z
      .preprocess(
        parseImagesMeta,
        z
          .array(galleryImageMetaSchema)
          .min(1, "At least one image is required")
          .optional(),
      )
      .optional(),
  })
  .refine((data) => hasDefinedField(data), {
    message: "At least one field must be provided for update",
  });

export const galleryQuerySchema = paginationSchema
  .merge(gallerySortSchema)
  .merge(searchSchema)
  .extend({
    occurredAtFrom: z.string().datetime().optional(),
    occurredAtTo: z.string().datetime().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  });

export const publicGalleryQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(publicGallerySortFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    occurredAtFrom: z.string().datetime().optional(),
    occurredAtTo: z.string().datetime().optional(),
    categorySlug: z.string().optional(),
    cursor: z.string().optional(),
  });

export const galleryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type GalleryImageMetaInput = z.infer<typeof galleryImageMetaSchema>;
export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
export type CreateGalleryFormInput = z.infer<typeof createGalleryFormSchema>;
export type UpdateGalleryFormInput = z.infer<typeof updateGalleryFormSchema>;
export type GalleryQuery = z.infer<typeof galleryQuerySchema>;
export type PublicGalleryQuery = z.infer<typeof publicGalleryQuerySchema>;
export type GalleryIdParams = z.infer<typeof galleryIdParamSchema>;
