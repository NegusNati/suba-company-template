import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { tagSchema } from "../../tags/lib/tags-schema";

export const vacancyStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export const vacancyWorkplaceTypeSchema = z.enum([
  "ONSITE",
  "REMOTE",
  "HYBRID",
]);

export const vacancyEmploymentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMP",
]);

export const vacancySenioritySchema = z.enum([
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
]);

export const vacancyListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  featuredImageUrl: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  workplaceType: vacancyWorkplaceTypeSchema.nullable(),
  employmentType: vacancyEmploymentTypeSchema.nullable(),
  seniority: vacancySenioritySchema.nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string().nullable(),
  externalApplyUrl: z.string().nullable(),
  applyEmail: z.string().nullable(),
  status: vacancyStatusSchema,
  publishedAt: z.string().nullable(),
  deadlineAt: z.string().nullable(),
  createdByUserId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(tagSchema).default([]),
  applicationCount: z.number().default(0),
});

export const vacancyDetailSchema = vacancyListItemSchema.extend({
  description: z.string(),
});

export type VacancyListItem = z.infer<typeof vacancyListItemSchema>;
export type Vacancy = z.infer<typeof vacancyDetailSchema>;

export const createVacancySchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    excerpt: z.string().max(255).optional(),
    description: z.string().min(1, "Description is required"),
    department: z.string().optional(),
    location: z.string().optional(),
    workplaceType: vacancyWorkplaceTypeSchema.optional(),
    employmentType: vacancyEmploymentTypeSchema.optional(),
    seniority: vacancySenioritySchema.optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    salaryCurrency: z.string().max(10).optional(),
    externalApplyUrl: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim().length === 0
          ? undefined
          : value,
      z.string().url().optional(),
    ),
    applyEmail: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim().length === 0
          ? undefined
          : value,
      z.string().email().optional(),
    ),
    status: vacancyStatusSchema.default("DRAFT"),
    publishedAt: z.string().optional(),
    deadlineAt: z.string().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
    featuredImage: z
      .instanceof(File)
      .refine(
        (file) =>
          IMAGE_MIME_TYPES.includes(
            file.type as (typeof IMAGE_MIME_TYPES)[number],
          ),
        "Featured image must be a supported image type",
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    { message: "salaryMin must be <= salaryMax", path: ["salaryMax"] },
  );

export const updateVacancySchema = createVacancySchema.partial();

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;

export const vacanciesListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "title",
      "publishedAt",
      "deadlineAt",
      "status",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: vacancyStatusSchema.optional(),
});

export type VacanciesListParams = z.infer<typeof vacanciesListParamsSchema>;

export const normalizeVacanciesListParams = (
  params: Partial<VacanciesListParams> = {},
): VacanciesListParams => {
  const parsed = vacanciesListParamsSchema.parse(params);
  return { ...parsed, search: parsed.search?.trim() || undefined };
};

export const vacancyApplicationStatusSchema = z.enum([
  "SUBMITTED",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
]);

export const vacancyApplicationSchema = z.object({
  id: z.number(),
  vacancyId: z.number(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  resumeUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  coverLetter: z.string().nullable(),
  status: vacancyApplicationStatusSchema,
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
  notes: z.string().nullable(),
});

export type VacancyApplication = z.infer<typeof vacancyApplicationSchema>;

export const vacancyApplicationsListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: vacancyApplicationStatusSchema.optional(),
});

export type VacancyApplicationsListParams = z.infer<
  typeof vacancyApplicationsListParamsSchema
>;

export const normalizeVacancyApplicationsListParams = (
  params: Partial<VacancyApplicationsListParams> = {},
): VacancyApplicationsListParams => {
  const parsed = vacancyApplicationsListParamsSchema.parse(params);
  return { ...parsed, search: parsed.search?.trim() || undefined };
};

export const updateVacancyApplicationSchema = z
  .object({
    status: vacancyApplicationStatusSchema.optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateVacancyApplicationInput = z.infer<
  typeof updateVacancyApplicationSchema
>;
