import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogSortFields = ["publishDate", "createdAt", "title"] as const;
export type BlogSortField = (typeof blogSortFields)[number];

const blogSortSchema = sortSchema.extend({
  sortBy: z.enum(blogSortFields).optional(),
});

export const createBlogSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImageUrl: z
    .string()
    .refine(
      (val) => val.startsWith("http") || val.startsWith("/"),
      "Must be a valid URL or relative path starting with /",
    )
    .optional(),
  authorId: z.string().min(1),
  publishDate: z.string().datetime().optional(),
  readTimeMinutes: z.number().int().positive().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
});

// Schema for multipart form data (used in controller)
export const createBlogFormSchema = z.object({
  title: z.string().min(1).max(255),
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
  content: z.string().min(1),
  authorId: z.string().min(1),
  publishDate: z
    .string()
    .datetime()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  readTimeMinutes: z
    .string()
    .nullable()
    .transform((val) =>
      val === null ? undefined : val ? parseInt(val, 10) : undefined,
    )
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
  featuredImage: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
});

export const updateBlogSchema = buildUpdateSchema(createBlogSchema, ["slug"]);

export const updateBlogFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
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
    content: z
      .string()
      .min(1)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    authorId: z
      .string()
      .min(1)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    publishDate: z
      .string()
      .datetime()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    readTimeMinutes: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? parseInt(val, 10) : undefined,
      )
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
    featuredImage: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    featuredImageUrl: z
      .string()
      .refine(
        (val) => val.startsWith("http") || val.startsWith("/"),
        "Must be a valid URL or relative path starting with /",
      )
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const blogQuerySchema = paginationSchema
  .merge(blogSortSchema)
  .merge(searchSchema)
  .extend({
    authorId: z.string().optional(),
    tagId: z.coerce.number().int().positive().optional(),
    published: z.enum(["true", "false"]).optional(),
    cursor: z.string().optional(),
  });

export const blogIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type CreateBlogFormInput = z.infer<typeof createBlogFormSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type UpdateBlogFormInput = z.infer<typeof updateBlogFormSchema>;
export type BlogQuery = z.infer<typeof blogQuerySchema>;
export type BlogIdParams = z.infer<typeof blogIdParamSchema>;
