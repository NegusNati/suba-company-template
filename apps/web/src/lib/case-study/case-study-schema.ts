import { z } from "zod";

// ============================================================================
// Tag Schema (shared)
// ============================================================================

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

// ============================================================================
// Case Study Image Schema
// ============================================================================

export const CaseStudyImageSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  caption: z.string().nullable(),
  position: z.number(),
});

export type CaseStudyImage = z.infer<typeof CaseStudyImageSchema>;

// ============================================================================
// Case Study Client Schema
// ============================================================================

export const CaseStudyClientSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
});

export type CaseStudyClient = z.infer<typeof CaseStudyClientSchema>;

// ============================================================================
// Case Study Service Schema
// ============================================================================

export const CaseStudyServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
});

export type CaseStudyService = z.infer<typeof CaseStudyServiceSchema>;

// ============================================================================
// Public Case Study List Item Schema
// ============================================================================

export const PublicCaseStudyListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  clientName: z.string().nullable(),
  serviceName: z.string().nullable(),
  featuredImage: z.string().nullable(),
});

export type PublicCaseStudyListItem = z.infer<
  typeof PublicCaseStudyListItemSchema
>;

// ============================================================================
// Public Case Study Detail Schema
// ============================================================================

export const PublicCaseStudyDetailSchema = z.object({
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
  client: CaseStudyClientSchema.nullable(),
  service: CaseStudyServiceSchema.nullable(),
  images: z.array(CaseStudyImageSchema),
  tags: z.array(TagSchema),
});

export type PublicCaseStudyDetail = z.infer<typeof PublicCaseStudyDetailSchema>;

// ============================================================================
// API Response Schemas
// ============================================================================

export const PublicCaseStudiesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PublicCaseStudyListItemSchema),
});

export const PublicCaseStudyDetailResponseSchema = z.object({
  success: z.boolean(),
  data: PublicCaseStudyDetailSchema,
});

export type PublicCaseStudiesListResponse = z.infer<
  typeof PublicCaseStudiesListResponseSchema
>;
export type PublicCaseStudyDetailResponse = z.infer<
  typeof PublicCaseStudyDetailResponseSchema
>;
