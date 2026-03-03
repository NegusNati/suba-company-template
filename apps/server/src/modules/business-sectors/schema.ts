import { z } from "zod";

export const businessSectorStatResponseSchema = z.object({
  id: z.number(),
  statKey: z.string(),
  statValue: z.string(),
  position: z.number(),
});

export const businessSectorServiceResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  position: z.number(),
});

export const businessSectorGalleryImageResponseSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  position: z.number(),
});

export const businessSectorResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  history: z.string(),
  featuredImageUrl: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  emailAddress: z.string().nullable(),
  address: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  publishDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  stats: z.array(businessSectorStatResponseSchema),
  services: z.array(businessSectorServiceResponseSchema),
  gallery: z.array(businessSectorGalleryImageResponseSchema),
});

export const businessSectorPublicListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  featuredImageUrl: z.string().nullable(),
  publishDate: z.string().nullable(),
});

export type BusinessSectorResponse = z.infer<
  typeof businessSectorResponseSchema
>;
export type BusinessSectorPublicListItem = z.infer<
  typeof businessSectorPublicListItemSchema
>;
