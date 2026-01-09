import { z } from "zod";

import { authorDtoSchema, tagDtoSchema } from "../../shared/types/relations";

export const blogResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featuredImageUrl: z.string().nullable(),
  authorId: z.string(),
  author: authorDtoSchema,
  publishDate: z.string().nullable(),
  readTimeMinutes: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const blogWithTagsResponseSchema = blogResponseSchema.extend({
  tags: z.array(tagDtoSchema),
});

export type BlogResponse = z.infer<typeof blogResponseSchema>;
export type BlogWithTagsResponse = z.infer<typeof blogWithTagsResponseSchema>;
