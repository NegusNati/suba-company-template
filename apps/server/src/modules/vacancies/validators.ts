import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const vacancyWorkplaceTypes = ["ONSITE", "REMOTE", "HYBRID"] as const;
export type VacancyWorkplaceType = (typeof vacancyWorkplaceTypes)[number];

export const vacancyEmploymentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMP",
] as const;
export type VacancyEmploymentType = (typeof vacancyEmploymentTypes)[number];

export const vacancySeniorities = [
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
] as const;
export type VacancySeniority = (typeof vacancySeniorities)[number];

export const vacancyStatuses = [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
] as const;
export type VacancyStatus = (typeof vacancyStatuses)[number];

export const vacancyApplicationStatuses = [
  "SUBMITTED",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
] as const;
export type VacancyApplicationStatus =
  (typeof vacancyApplicationStatuses)[number];

export const createVacancySchema = z
  .object({
    title: z.string().min(1).max(255),
    slug: z
      .string()
      .regex(slugRegex, "Slug must be lowercase with hyphens")
      .optional(),
    excerpt: z.string().optional(),
    description: z.string().min(1),
    featuredImageUrl: z
      .string()
      .refine(
        (val) => val.startsWith("http") || val.startsWith("/"),
        "Must be a valid URL or relative path starting with /",
      )
      .optional(),
    department: z.string().optional(),
    location: z.string().optional(),
    workplaceType: z.enum(vacancyWorkplaceTypes).optional(),
    employmentType: z.enum(vacancyEmploymentTypes).optional(),
    seniority: z.enum(vacancySeniorities).optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    salaryCurrency: z.string().max(10).optional(),
    externalApplyUrl: z.string().url().optional(),
    applyEmail: z.string().email().optional(),
    status: z.enum(vacancyStatuses).optional(),
    publishedAt: z.string().datetime().optional(),
    deadlineAt: z.string().datetime().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "salaryMin must be less than or equal to salaryMax",
      path: ["salaryMax"],
    },
  );

export const createVacancyFormSchema = z
  .object({
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
    description: z.string().min(1),
    department: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    location: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    workplaceType: z
      .enum(vacancyWorkplaceTypes)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    employmentType: z
      .enum(vacancyEmploymentTypes)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    seniority: z
      .enum(vacancySeniorities)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    salaryMin: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? parseInt(val, 10) : undefined,
      )
      .optional(),
    salaryMax: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? parseInt(val, 10) : undefined,
      )
      .optional(),
    salaryCurrency: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    externalApplyUrl: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    applyEmail: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    status: z
      .enum(vacancyStatuses)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    publishedAt: z
      .string()
      .datetime()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    deadlineAt: z
      .string()
      .datetime()
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
    featuredImageUrl: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    featuredImage: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "salaryMin must be less than or equal to salaryMax",
      path: ["salaryMax"],
    },
  );

export const updateVacancySchema = buildUpdateSchema(createVacancySchema, [
  "slug",
]);

export const updateVacancyFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(255)
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
      .min(1)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    department: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    location: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    workplaceType: z
      .enum(vacancyWorkplaceTypes)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    employmentType: z
      .enum(vacancyEmploymentTypes)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    seniority: z
      .enum(vacancySeniorities)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    salaryMin: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? parseInt(val, 10) : undefined,
      )
      .optional(),
    salaryMax: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? parseInt(val, 10) : undefined,
      )
      .optional(),
    salaryCurrency: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    externalApplyUrl: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    applyEmail: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    status: z
      .enum(vacancyStatuses)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    publishedAt: z
      .string()
      .datetime()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    deadlineAt: z
      .string()
      .datetime()
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
    featuredImageUrl: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    featuredImage: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "salaryMin must be less than or equal to salaryMax",
      path: ["salaryMax"],
    },
  );

export const vacancySortFields = [
  "createdAt",
  "updatedAt",
  "title",
  "publishedAt",
  "deadlineAt",
  "status",
] as const;
export type VacancySortField = (typeof vacancySortFields)[number];

const vacancySortSchema = sortSchema.extend({
  sortBy: z.enum(vacancySortFields).optional(),
});

export const vacancyQuerySchema = paginationSchema
  .merge(vacancySortSchema)
  .merge(searchSchema)
  .extend({
    status: z.enum(vacancyStatuses).optional(),
  });

export const publicVacancySortFields = [
  "publishedAt",
  "deadlineAt",
  "createdAt",
  "title",
] as const;
export type PublicVacancySortField = (typeof publicVacancySortFields)[number];

const publicVacancySortSchema = sortSchema.extend({
  sortBy: z.enum(publicVacancySortFields).optional(),
});

export const publicVacancyQuerySchema = paginationSchema
  .merge(publicVacancySortSchema)
  .merge(searchSchema)
  .extend({
    openOnly: z.coerce.boolean().optional(),
  });

export const vacancyIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const vacancyApplicationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  applicationId: z.coerce.number().int().positive(),
});

export const vacancyApplicationSortFields = ["createdAt", "status"] as const;
export type VacancyApplicationSortField =
  (typeof vacancyApplicationSortFields)[number];

const vacancyApplicationSortSchema = sortSchema.extend({
  sortBy: z.enum(vacancyApplicationSortFields).optional(),
});

export const vacancyApplicationQuerySchema = paginationSchema
  .merge(vacancyApplicationSortSchema)
  .merge(searchSchema)
  .extend({
    status: z.enum(vacancyApplicationStatuses).optional(),
  });

export const createVacancyApplicationSchema = z.object({
  fullName: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  resumeUrl: z
    .string()
    .refine(
      (val) => val.startsWith("http") || val.startsWith("/"),
      "Must be a valid URL or relative path starting with /",
    )
    .optional(),
  portfolioUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  coverLetter: z.string().max(10_000).optional(),
});

export const createVacancyApplicationFormSchema = z.object({
  fullName: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  portfolioUrl: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  linkedinUrl: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  coverLetter: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  resume: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  honeypot: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
});

export const updateVacancyApplicationSchema = z
  .object({
    status: z.enum(vacancyApplicationStatuses).optional(),
    notes: z.string().max(10_000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type CreateVacancyFormInput = z.infer<typeof createVacancyFormSchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
export type UpdateVacancyFormInput = z.infer<typeof updateVacancyFormSchema>;
export type VacancyQuery = z.infer<typeof vacancyQuerySchema>;
export type PublicVacancyQuery = z.infer<typeof publicVacancyQuerySchema>;
export type VacancyIdParams = z.infer<typeof vacancyIdParamSchema>;
export type VacancyApplicationIdParams = z.infer<
  typeof vacancyApplicationIdParamSchema
>;
export type VacancyApplicationQuery = z.infer<
  typeof vacancyApplicationQuerySchema
>;
export type CreateVacancyApplicationInput = z.infer<
  typeof createVacancyApplicationSchema
>;
export type CreateVacancyApplicationFormInput = z.infer<
  typeof createVacancyApplicationFormSchema
>;
export type UpdateVacancyApplicationInput = z.infer<
  typeof updateVacancyApplicationSchema
>;
