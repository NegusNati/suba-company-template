import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const caseStudySortFields = ["createdAt", "title", "updatedAt"] as const;
export type CaseStudySortField = (typeof caseStudySortFields)[number];
const publicCaseStudySortFields = ["createdAt", "title"] as const;

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const caseStudyImageSchema = z.object({
  imageUrl: z.string().refine(urlRefine, urlErrorMessage),
  caption: z.string().optional(),
  position: z.number().int().min(0).default(0),
});

export const createCaseStudySchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
  excerpt: z.string().optional(),
  overview: z.string().optional(),
  clientId: z.number().int().positive().nullable().optional(),
  projectScope: z.string().optional(),
  impact: z.string().optional(),
  problem: z.string().optional(),
  process: z.string().optional(),
  deliverable: z.string().optional(),
  serviceId: z.number().int().positive().nullable().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
  images: z.array(caseStudyImageSchema).optional(),
});

// Schema for multipart form data (used in controller)
export const createCaseStudyFormSchema = z.object({
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
  overview: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  clientId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine(
      (val) => val === undefined || (Number.isInteger(val) && val > 0),
      "Must be positive integer",
    )
    .optional(),
  projectScope: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  impact: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  problem: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  process: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  deliverable: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  serviceId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine(
      (val) => val === undefined || (Number.isInteger(val) && val > 0),
      "Must be positive integer",
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

export const updateCaseStudySchema = buildUpdateSchema(createCaseStudySchema, [
  "slug",
]);

const caseStudyImageMetaSchema = z.object({
  position: z.number().int().min(0).optional(),
  caption: z.string().optional(),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
});

export const updateCaseStudyFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(500)
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
    overview: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    clientId: z
      .string()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val > 0),
        "Must be positive integer",
      )
      .optional(),
    projectScope: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    impact: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    problem: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    process: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    deliverable: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    serviceId: z
      .string()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val > 0),
        "Must be positive integer",
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
              (img) => caseStudyImageMetaSchema.safeParse(img).success,
            )),
        "imagesMeta must be an array of objects with position and optional imageUrl",
      ),
  })
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one field must be provided for update",
  });

const caseStudySortSchema = sortSchema.extend({
  sortBy: z.enum(caseStudySortFields).optional(),
});

export const caseStudyQuerySchema = paginationSchema
  .merge(caseStudySortSchema)
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(caseStudySortFields).optional(),
    clientId: z.coerce.number().int().positive().optional(),
    serviceId: z.coerce.number().int().positive().optional(),
    tagId: z.coerce.number().int().positive().optional(),
  });

export const publicCaseStudyQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(publicCaseStudySortFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    clientId: z.coerce.number().int().positive().optional(),
    serviceId: z.coerce.number().int().positive().optional(),
    tagId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    cursor: z.string().optional(),
  });

export const caseStudyIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CaseStudyImageInput = z.infer<typeof caseStudyImageSchema>;
export type CreateCaseStudyInput = z.infer<typeof createCaseStudySchema>;
export type CreateCaseStudyFormInput = z.infer<
  typeof createCaseStudyFormSchema
>;
export type UpdateCaseStudyInput = z.infer<typeof updateCaseStudySchema>;
export type UpdateCaseStudyFormInput = z.infer<
  typeof updateCaseStudyFormSchema
>;
export type CaseStudyQuery = z.infer<typeof caseStudyQuerySchema>;
export type PublicCaseStudyQuery = z.infer<typeof publicCaseStudyQuerySchema>;
export type CaseStudyIdParams = z.infer<typeof caseStudyIdParamSchema>;
