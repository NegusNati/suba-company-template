import { z } from "zod";

export const tagSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string(),
  createdAt: z.string(),
});

export const createTagSchema = tagSchema.omit({
  id: true,
  slug: true,
  createdAt: true,
});

export const tagListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
});

export type Tag = z.infer<typeof tagSchema>;
export type CreateTag = z.infer<typeof createTagSchema>;
export type TagListParams = z.infer<typeof tagListParamsSchema>;

export function normalizeTagListParams(
  params: Partial<TagListParams>,
): TagListParams {
  return {
    page: Number(params.page) > 0 ? Number(params.page) : 1,
    limit: Number(params.limit) > 0 ? Number(params.limit) : 10,
    search: params.search?.trim() || undefined,
  };
}
