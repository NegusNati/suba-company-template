import { z } from "zod";

import { tagDtoSchema } from "../../shared/types/relations";

export const vacancyResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  description: z.string(),
  featuredImageUrl: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  workplaceType: z.string().nullable(),
  employmentType: z.string().nullable(),
  seniority: z.string().nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string().nullable(),
  externalApplyUrl: z.string().nullable(),
  applyEmail: z.string().nullable(),
  status: z.string(),
  publishedAt: z.string().nullable(),
  deadlineAt: z.string().nullable(),
  createdByUserId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(tagDtoSchema).default([]),
  applicationCount: z.number().default(0),
});

export const vacancyApplicationResponseSchema = z.object({
  id: z.number(),
  vacancyId: z.number(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  resumeUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  coverLetter: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
  notes: z.string().nullable(),
});

export type VacancyResponse = z.infer<typeof vacancyResponseSchema>;
export type VacancyApplicationResponse = z.infer<
  typeof vacancyApplicationResponseSchema
>;
