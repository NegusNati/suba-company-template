import { z } from "zod";

/**
 * Schema for a public service item in list view
 */
export const publicServiceListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  featuredImage: z.string().nullable(),
});

/**
 * Schema for a public service detail view
 */
export const publicServiceDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  images: z.array(
    z.object({
      imageUrl: z.string(),
      position: z.number(),
    }),
  ),
  createdAt: z.string(),
});

/**
 * TypeScript types inferred from schemas
 */
export type PublicServiceListItem = z.infer<typeof publicServiceListItemSchema>;
export type PublicServiceDetail = z.infer<typeof publicServiceDetailSchema>;
export type PublicService = PublicServiceListItem | PublicServiceDetail;
