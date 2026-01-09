import { z } from "zod";

// ============================================================================
// Public Tag Schema
// ============================================================================

export const PublicTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type PublicTag = z.infer<typeof PublicTagSchema>;

// ============================================================================
// API Response Schemas
// ============================================================================

export const PublicTagsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PublicTagSchema),
});

export type PublicTagsListResponse = z.infer<
  typeof PublicTagsListResponseSchema
>;
