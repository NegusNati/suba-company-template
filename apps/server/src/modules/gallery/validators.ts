import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const gallerySortFields = ["occurredAt", "createdAt", "title"] as const;
export type GallerySortField = (typeof gallerySortFields)[number];
const publicGallerySortFields = ["occurredAt", "createdAt"] as const;

const gallerySortSchema = sortSchema.extend({
  sortBy: z.enum(gallerySortFields).optional(),
});

export const createGalleryItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage),
  occurredAt: z.string().datetime().optional(),
});

export const updateGalleryItemSchema = buildUpdateSchema(
  createGalleryItemSchema,
);

export const createGalleryFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  occurredAt: z
    .string()
    .datetime()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  image: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
});

export const updateGalleryFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    description: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    occurredAt: z
      .string()
      .datetime()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    image: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    imageUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const galleryQuerySchema = paginationSchema
  .merge(gallerySortSchema)
  .merge(searchSchema)
  .extend({
    occurredAtFrom: z.string().datetime().optional(),
    occurredAtTo: z.string().datetime().optional(),
  });

export const publicGalleryQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(publicGallerySortFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    occurredAtFrom: z.string().datetime().optional(),
    occurredAtTo: z.string().datetime().optional(),
    cursor: z.string().optional(),
  });

export const galleryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
export type GalleryQuery = z.infer<typeof galleryQuerySchema>;
export type PublicGalleryQuery = z.infer<typeof publicGalleryQuerySchema>;
export type GalleryIdParams = z.infer<typeof galleryIdParamSchema>;
