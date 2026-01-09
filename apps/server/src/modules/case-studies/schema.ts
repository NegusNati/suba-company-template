import { z } from "zod";

import {
  partnerSummaryDtoSchema,
  serviceSummaryDtoSchema,
  tagDtoSchema,
  imageDtoSchema,
} from "../../shared/types/relations";

export const caseStudyResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  overview: z.string().nullable(),
  clientId: z.number().nullable(),
  projectScope: z.string().nullable(),
  impact: z.string().nullable(),
  problem: z.string().nullable(),
  process: z.string().nullable(),
  deliverable: z.string().nullable(),
  serviceId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  client: partnerSummaryDtoSchema.nullable(),
  service: serviceSummaryDtoSchema.nullable(),
  images: z.array(imageDtoSchema),
  tags: z.array(tagDtoSchema),
});

export const caseStudyImageResponseSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  caption: z.string().nullable(),
  position: z.number(),
});

export const caseStudyClientResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
});

export const caseStudyServiceResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
});

export const caseStudyTagResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const caseStudyWithRelationsSchema = caseStudyResponseSchema;

export const publicCaseStudyListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  clientName: z.string().nullable(),
  serviceName: z.string().nullable(),
  featuredImage: z.string().nullable(),
});

export const publicCaseStudyDetailSchema = caseStudyWithRelationsSchema;

export type CaseStudyResponse = z.infer<typeof caseStudyResponseSchema>;
export type CaseStudyWithRelations = z.infer<
  typeof caseStudyWithRelationsSchema
>;
export type PublicCaseStudyListItem = z.infer<
  typeof publicCaseStudyListItemSchema
>;
export type PublicCaseStudyDetail = z.infer<typeof publicCaseStudyDetailSchema>;
