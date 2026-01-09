import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const serviceSortFields = ["createdAt", "title", "updatedAt"] as const;
export type ServiceSortField = (typeof serviceSortFields)[number];
const publicServiceSortFields = ["createdAt", "title"] as const;

const serviceSortSchema = sortSchema.extend({
  sortBy: z.enum(serviceSortFields).optional(),
});

export const serviceImageSchema = z.object({
  imageUrl: z.string().refine(urlRefine, urlErrorMessage),
  position: z.number().int().min(0).default(0),
});

export const createServiceSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  images: z.array(serviceImageSchema).optional(),
});

// Schema for multipart form data (used in controller)
export const createServiceFormSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  excerpt: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  description: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  imagesMeta: z
    .string()
    .nullable()
    .transform((val) =>
      val === null ? undefined : val ? JSON.parse(val) : undefined,
    )
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        (Array.isArray(val) &&
          val.every(
            (img) =>
              typeof img === "object" &&
              Number.isInteger(img.position) &&
              img.position >= 0,
          )),
      "imagesMeta must be an array of objects with position",
    ),
});

export const updateServiceSchema = buildUpdateSchema(createServiceSchema, [
  "slug",
]);

const serviceImageMetaSchema = z.object({
  position: z.number().int().min(0).optional(),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
});

export const updateServiceFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(500)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    excerpt: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    description: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    imagesMeta: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? JSON.parse(val) : undefined,
      )
      .optional()
      .refine(
        (val) =>
          val === undefined ||
          (Array.isArray(val) &&
            val.every((img) => serviceImageMetaSchema.safeParse(img).success)),
        "imagesMeta must be an array of objects with position and optional imageUrl",
      ),
  })
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one field must be provided for update",
  });

export const serviceQuerySchema = paginationSchema
  .merge(serviceSortSchema)
  .merge(searchSchema)
  .extend({});

export const publicServiceQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(publicServiceSortFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    tagId: z.coerce.number().int().positive().optional(),
    cursor: z.string().optional(),
  });

export type ServiceImageInput = z.infer<typeof serviceImageSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateServiceFormInput = z.infer<typeof createServiceFormSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type UpdateServiceFormInput = z.infer<typeof updateServiceFormSchema>;
export type ServiceQuery = z.infer<typeof serviceQuerySchema>;
export type PublicServiceQuery = z.infer<typeof publicServiceQuerySchema>;
