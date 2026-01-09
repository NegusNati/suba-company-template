import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { tagSchema } from "../../tags/lib/tags-schema";

export const blogSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featuredImageUrl: z.string().nullable(),
  authorId: z.string(),
  publishDate: z.string().nullable(),
  readTimeMinutes: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(tagSchema),
});

export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  excerpt: z.string().min(1, "Excerpt is required").max(255),
  content: z.string().min(1, "Content is required"),
  publishDate: z.string().min(1, "Publish date is required"),
  authorId: z.string().min(1, "Author is required"),
  readTimeMinutes: z
    .number()
    .int()
    .positive("Read time must be positive")
    .min(1, "Read time is required"),
  tagIds: z.array(z.number().int().positive()).min(1, "Tags are required"),
  featuredImage: z
    .instanceof(File)
    .refine(
      (file) =>
        IMAGE_MIME_TYPES.includes(
          file.type as (typeof IMAGE_MIME_TYPES)[number],
        ),
      "Featured image must be a supported image type",
    ),
});

export const updateBlogSchema = createBlogSchema.partial();

export type Blog = z.infer<typeof blogSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type UpdateBlog = UpdateBlogInput & {
  id?: number;
  featuredImageUrl?: string | null;
};

export const blogsListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "title", "publishDate", "updatedAt"])
    .default("publishDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  authorId: z.string().optional(),
  tagId: z.number().int().positive().optional(),
  published: z.enum(["true", "false"]).optional(),
});

export type BlogsListParams = z.infer<typeof blogsListParamsSchema>;

export const normalizeBlogsListParams = (
  params: Partial<BlogsListParams> = {},
): BlogsListParams => {
  const parsed = blogsListParamsSchema.parse(params);
  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
