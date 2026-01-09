import { DOCUMENT_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

export const publicVacancyStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export const publicVacancyWorkplaceTypeSchema = z.enum([
  "ONSITE",
  "REMOTE",
  "HYBRID",
]);

export const publicVacancyEmploymentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMP",
]);

export const publicVacancySenioritySchema = z.enum([
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
]);

export const publicTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const publicVacancyListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  featuredImageUrl: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  workplaceType: publicVacancyWorkplaceTypeSchema.nullable(),
  employmentType: publicVacancyEmploymentTypeSchema.nullable(),
  seniority: publicVacancySenioritySchema.nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string().nullable(),
  externalApplyUrl: z.string().nullable(),
  applyEmail: z.string().nullable(),
  status: publicVacancyStatusSchema,
  publishedAt: z.string().nullable(),
  deadlineAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(publicTagSchema).default([]),
  isExpired: z.boolean().default(false),
  canApply: z.boolean().default(false),
});

export const publicVacancyDetailSchema = publicVacancyListItemSchema.extend({
  description: z.string(),
  applicationCount: z.number().default(0),
});

export type PublicVacancyListItem = z.infer<typeof publicVacancyListItemSchema>;
export type PublicVacancyDetail = z.infer<typeof publicVacancyDetailSchema>;

export const publicVacancyListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  openOnly: z.boolean().optional(),
});

export type PublicVacancyListParams = z.infer<
  typeof publicVacancyListParamsSchema
>;

export const normalizePublicVacancyListParams = (
  params: Partial<PublicVacancyListParams> = {},
): PublicVacancyListParams => {
  const parsed = publicVacancyListParamsSchema.parse(params);
  return { ...parsed, search: parsed.search?.trim() || undefined };
};

export const vacancyApplicationFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().or(z.literal("")),
  resume: z
    .instanceof(File)
    .optional()
    .refine(
      (file) =>
        !file ||
        DOCUMENT_MIME_TYPES.includes(
          file.type as (typeof DOCUMENT_MIME_TYPES)[number],
        ),
      "Resume must be a PDF, DOC, or DOCX file",
    )
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "Max size is 10MB",
    ),
  portfolioUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  coverLetter: z.string().optional().or(z.literal("")),
  consent: z.boolean().refine((val) => val === true, "Consent is required"),
  honeypot: z.string().optional(),
});

export type VacancyApplicationFormValues = z.infer<
  typeof vacancyApplicationFormSchema
>;

export const vacancyApplicationSubmitResponseSchema = z.object({
  id: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

export type VacancyApplicationSubmitResponse = z.infer<
  typeof vacancyApplicationSubmitResponseSchema
>;
