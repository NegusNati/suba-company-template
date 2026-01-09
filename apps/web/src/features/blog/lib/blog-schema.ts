import { z } from "zod";

// ============================================================================
// Blog List Item Schema
// ============================================================================

export const BlogListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  featuredImageUrl: z.string().nullable(),
  publishDate: z.string().nullable(),
  readTimeMinutes: z.number().nullable(),
});

export type BlogListItem = z.infer<typeof BlogListItemSchema>;

// ============================================================================
// Blog Social Schema
// ============================================================================

export const BlogSocialSchema = z.object({
  id: z.number(),
  handle: z.string().nullable(),
  fullUrl: z.string().nullable(),
  title: z.string(),
  iconUrl: z.string().nullable(),
  baseUrl: z.string(),
});

export type BlogSocial = z.infer<typeof BlogSocialSchema>;

// ============================================================================
// Blog Author Schema
// ============================================================================

export const BlogAuthorSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  email: z.string().optional(),
  image: z.string().nullable(),
  socials: z.array(BlogSocialSchema).optional().default([]),
});

export type BlogAuthor = z.infer<typeof BlogAuthorSchema>;

// ============================================================================
// Blog Tag Schema
// ============================================================================

export const BlogTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type BlogTag = z.infer<typeof BlogTagSchema>;

// ============================================================================
// Blog Detail Schema
// ============================================================================

export const BlogDetailSchema = BlogListItemSchema.extend({
  content: z.string(),
  author: BlogAuthorSchema.nullable(),
  tags: z.array(BlogTagSchema),
});

export type BlogDetail = z.infer<typeof BlogDetailSchema>;

// ============================================================================
// API Response Schemas
// ============================================================================

export const BlogListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BlogListItemSchema),
});

export const BlogDetailResponseSchema = z.object({
  success: z.boolean(),
  data: BlogDetailSchema,
});
