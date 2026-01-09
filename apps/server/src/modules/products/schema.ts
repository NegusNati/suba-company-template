import { z } from "zod";

import { imageDtoSchema, tagDtoSchema } from "../../shared/types/relations";

export const productResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  overview: z.string().nullable(),
  productLink: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(imageDtoSchema),
  tags: z.array(tagDtoSchema),
});

export const productImageResponseSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  position: z.number(),
});

export const productTagResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const productWithRelationsSchema = productResponseSchema;

export const publicProductListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  featuredImage: z.string().nullable(),
});

export const publicProductDetailSchema = productWithRelationsSchema;

export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductWithRelations = z.infer<typeof productWithRelationsSchema>;
export type PublicProductListItem = z.infer<typeof publicProductListItemSchema>;
export type PublicProductDetail = z.infer<typeof publicProductDetailSchema>;
