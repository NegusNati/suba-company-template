import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { tagSchema } from "../../tags/lib/tags-schema";

export const productImageSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  position: z.number(),
  caption: z.string().optional().nullable(),
});

export const productSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  slug: z.string(),
  description: z.string().min(1, "Description is required"),
  overview: z.string().nullable(),
  productLink: z.string().url().nullable(),
  tags: z.array(tagSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(productImageSchema),
});

export const createProductSchema = productSchema
  .omit({
    id: true,
    slug: true,
    tags: true,
    images: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    tagIds: z.array(z.number().int().positive()).optional(),
    imagesMeta: z
      .array(
        z.object({
          position: z.number(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    images: z.array(
      z
        .instanceof(File)
        .refine(
          (file) =>
            IMAGE_MIME_TYPES.includes(
              file.type as (typeof IMAGE_MIME_TYPES)[number],
            ),
          "Featured image must be a supported image type",
        ),
    ),
  });

export const updateProductSchema = createProductSchema.partial();

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProduct = UpdateProductInput & {
  id?: number;
  existingImages?: Product["images"];
};

export const productsListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  tagId: z.number().int().positive().optional(),
});

export type ProductsListParams = z.infer<typeof productsListParamsSchema>;

export const normalizeProductsListParams = (
  params: Partial<ProductsListParams> = {},
): ProductsListParams => {
  const parsed = productsListParamsSchema.parse(params);

  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
