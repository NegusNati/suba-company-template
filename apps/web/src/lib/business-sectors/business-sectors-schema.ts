import { z } from "zod";

export const publicBusinessSectorStatSchema = z.object({
  id: z.number(),
  statKey: z.string(),
  statValue: z.string(),
  position: z.number(),
});

export const publicBusinessSectorServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  position: z.number(),
});

export const publicBusinessSectorGallerySchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  position: z.number(),
});

export const publicBusinessSectorListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  featuredImageUrl: z.string().nullable(),
  publishDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  stats: z.array(publicBusinessSectorStatSchema),
  services: z.array(publicBusinessSectorServiceSchema),
  gallery: z.array(publicBusinessSectorGallerySchema),
  history: z.string(),
  phoneNumber: z.string().nullable(),
  emailAddress: z.string().nullable(),
  address: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
});

export const publicBusinessSectorDetailSchema =
  publicBusinessSectorListItemSchema;

export type PublicBusinessSectorListItem = z.infer<
  typeof publicBusinessSectorListItemSchema
>;
export type PublicBusinessSectorDetail = z.infer<
  typeof publicBusinessSectorDetailSchema
>;

export interface PublicBusinessSectorsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "publishDate" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
}
