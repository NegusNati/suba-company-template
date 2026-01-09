import { z } from "zod";

// ============================================================================
// Tag Schema (shared with products and case studies)
// ============================================================================

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

// ============================================================================
// Product Image Schema
// ============================================================================

export const ProductImageSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  position: z.number(),
});

export type ProductImage = z.infer<typeof ProductImageSchema>;

// ============================================================================
// Public Product List Item Schema
// ============================================================================

export const PublicProductListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  featuredImage: z.string().nullable(),
});

export type PublicProductListItem = z.infer<typeof PublicProductListItemSchema>;

// ============================================================================
// Public Product Detail Schema
// ============================================================================

export const PublicProductDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  overview: z.string().nullable(),
  productLink: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(ProductImageSchema),
  tags: z.array(TagSchema),
});

export type PublicProductDetail = z.infer<typeof PublicProductDetailSchema>;

// ============================================================================
// API Response Schemas
// ============================================================================

export const PublicProductsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PublicProductListItemSchema),
});

export const PublicProductDetailResponseSchema = z.object({
  success: z.boolean(),
  data: PublicProductDetailSchema,
});

export type PublicProductsListResponse = z.infer<
  typeof PublicProductsListResponseSchema
>;
export type PublicProductDetailResponse = z.infer<
  typeof PublicProductDetailResponseSchema
>;
