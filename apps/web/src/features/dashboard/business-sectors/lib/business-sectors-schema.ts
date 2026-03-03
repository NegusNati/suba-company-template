import { z } from "zod";

import { createListParamsSchema, normalizeListParams } from "@/lib/list-params";

export const businessSectorStatSchema = z.object({
  id: z.number().optional(),
  statKey: z.string().min(1, "Key is required").max(120),
  statValue: z.string().min(1, "Value is required").max(120),
  position: z.number().int().min(0),
});

export const businessSectorServiceSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  position: z.number().int().min(0),
});

export const businessSectorGalleryImageSchema = z.object({
  id: z.number().optional(),
  imageUrl: z.string().optional(),
  position: z.number().int().min(0),
});

export const businessSectorSchema = z.object({
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
  stats: z.array(businessSectorStatSchema),
  services: z.array(businessSectorServiceSchema),
  gallery: z.array(businessSectorGalleryImageSchema),
});

export const businessSectorListParamsSchema = createListParamsSchema({
  sortBy: ["createdAt", "title", "updatedAt", "publishDate"] as const,
  defaultSortBy: "createdAt",
});

export type BusinessSector = z.infer<typeof businessSectorSchema>;
export type BusinessSectorStat = z.infer<typeof businessSectorStatSchema>;
export type BusinessSectorService = z.infer<typeof businessSectorServiceSchema>;
export type BusinessSectorGalleryImage = z.infer<
  typeof businessSectorGalleryImageSchema
>;
export type BusinessSectorListParams = z.infer<
  typeof businessSectorListParamsSchema
>;

export const normalizeBusinessSectorListParams = normalizeListParams(
  businessSectorListParamsSchema,
);

export type BusinessSectorStatFormItem = {
  statKey: string;
  statValue: string;
  position: number;
};

export type BusinessSectorServiceFormItem = {
  title: string;
  description?: string;
  imageUrl?: string;
  imageFile?: File;
  previewUrl?: string;
  position: number;
};

export type BusinessSectorGalleryFormItem = {
  imageUrl?: string;
  imageFile?: File;
  previewUrl?: string;
  position: number;
};

export type CreateBusinessSectorInput = {
  title: string;
  excerpt?: string;
  history: string;
  featuredImageFile?: File;
  featuredImageUrl?: string;
  publishDate?: string;
  phoneNumber?: string;
  emailAddress?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  stats?: BusinessSectorStatFormItem[];
  services?: BusinessSectorServiceFormItem[];
  gallery?: BusinessSectorGalleryFormItem[];
};

export type UpdateBusinessSectorInput = Partial<CreateBusinessSectorInput>;

export type UpdateBusinessSector = Partial<BusinessSector> & {
  id?: number;
};
