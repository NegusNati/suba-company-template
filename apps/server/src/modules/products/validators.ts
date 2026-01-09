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

export const productSortFields = ["createdAt", "title", "updatedAt"] as const;
export type ProductSortField = (typeof productSortFields)[number];
const publicProductSortFields = ["createdAt", "title"] as const;

const productSortSchema = sortSchema.extend({
  sortBy: z.enum(productSortFields).optional(),
});

export const productImageSchema = z.object({
  imageUrl: z.string().refine(urlRefine, urlErrorMessage),
  position: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
  description: z.string().optional(),
  overview: z.string().optional(),
  productLink: z.string().url().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
  images: z.array(productImageSchema).optional(),
});

// Schema for multipart form data (used in controller)
export const createProductFormSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  description: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  overview: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  productLink: z
    .string()
    .url()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  tagIds: z
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
          val.every((id) => Number.isInteger(id) && id > 0)),
      "tagIds must be an array of positive integers",
    ),
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
              Number.isInteger((img as { position?: unknown }).position) &&
              (img as { position?: number }).position! >= 0,
          )),
      "imagesMeta must be an array of objects with position",
    ),
});

export const updateProductSchema = buildUpdateSchema(createProductSchema, [
  "slug",
]);

const productImageMetaSchema = z.object({
  position: z.number().int().min(0).optional(),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
});

export const updateProductFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(500)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    description: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    overview: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    productLink: z
      .string()
      .url()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    tagIds: z
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
            val.every((id) => Number.isInteger(id) && id > 0)),
        "tagIds must be an array of positive integers",
      ),
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
            val.every((img) => productImageMetaSchema.safeParse(img).success)),
        "imagesMeta must be an array of objects with position and optional imageUrl",
      ),
  })
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one field must be provided for update",
  });

export const productQuerySchema = paginationSchema
  .merge(productSortSchema)
  .merge(searchSchema)
  .extend({
    tagId: z.coerce.number().int().positive().optional(),
  });

export const publicProductQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(publicProductSortFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    tagId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    cursor: z.string().optional(),
  });

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ProductImageInput = z.infer<typeof productImageSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateProductFormInput = z.infer<typeof createProductFormSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductFormInput = z.infer<typeof updateProductFormSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type PublicProductQuery = z.infer<typeof publicProductQuerySchema>;
export type ProductIdParams = z.infer<typeof productIdParamSchema>;
