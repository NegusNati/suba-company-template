import type { Context } from "hono";

import type { ProductService } from "./service";
import {
  productQuerySchema,
  createProductSchema,
  createProductFormSchema,
  updateProductSchema,
  updateProductFormSchema,
  publicProductQuerySchema,
  type ProductQuery,
  type PublicProductQuery,
  type ProductIdParams,
  type CreateProductInput,
  type UpdateProductInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadProductImage,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createProductController = (service: ProductService) => ({
  async listProducts(c: Context) {
    const query =
      (c.get("validatedQuery") as ProductQuery | undefined) ??
      productQuerySchema.parse(c.req.query());
    const result = await service.getProducts(query);
    return paginatedResponse(c, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  async getProduct(c: Context) {
    const { id } =
      (c.get("validatedParams") as ProductIdParams | undefined) ??
      (() => {
        const parsed = Number.parseInt(c.req.param("id"));
        if (Number.isNaN(parsed))
          throw new ValidationError("Invalid product ID");
        return { id: parsed };
      })();
    const product = await service.getProductWithRelations(id);
    return successResponse(c, product);
  },

  async createProduct(c: Context) {
    logger.info("createProduct - handling multipart form data");
    try {
      const formData = await c.req.formData();
      const formInput = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        description: formData.get("description"),
        overview: formData.get("overview"),
        productLink: formData.get("productLink"),
        tagIds: formData.get("tagIds"),
        imagesMeta: formData.get("imagesMeta"),
      };

      const validatedData = createProductFormSchema.parse(formInput);
      const uploadedImages: Array<{ imageUrl: string; position: number }> = [];

      if (validatedData.imagesMeta && validatedData.imagesMeta.length > 0) {
        for (let i = 0; i < validatedData.imagesMeta.length; i++) {
          const imageFile = formData.get(`images[${i}]`) as File | null;
          if (imageFile) {
            try {
              const imageUrl = await uploadProductImage(imageFile);
              uploadedImages.push({
                imageUrl,
                position: validatedData.imagesMeta[i].position || i,
              });
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }
        }
      }

      const productData =
        (c.get("validatedBody") as CreateProductInput | undefined) ??
        createProductSchema.parse({
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          overview: validatedData.overview,
          productLink: validatedData.productLink,
          tagIds: validatedData.tagIds,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        });

      const product = await service.createProduct(productData);
      return successResponse(c, product, 201);
    } catch (error) {
      logger.error("Error creating product", error as Error);
      throw error;
    }
  },

  async updateProduct(c: Context) {
    const { id } =
      (c.get("validatedParams") as ProductIdParams | undefined) ??
      (() => {
        const parsed = Number.parseInt(c.req.param("id"));
        if (Number.isNaN(parsed))
          throw new ValidationError("Invalid product ID");
        return { id: parsed };
      })();

    const contentType = c.req.header("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      logger.info("updateProduct - handling multipart form data");
      try {
        const formData = await c.req.formData();
        const formInput = {
          title: formData.get("title"),
          description: formData.get("description"),
          overview: formData.get("overview"),
          productLink: formData.get("productLink"),
          tagIds: formData.get("tagIds"),
          imagesMeta: formData.get("imagesMeta"),
        };

        const validatedData = updateProductFormSchema.parse(formInput);
        const uploadedImages: Array<{ imageUrl: string; position: number }> =
          [];

        if (validatedData.imagesMeta !== undefined) {
          for (let i = 0; i < validatedData.imagesMeta.length; i++) {
            const imageFile = formData.get(`images[${i}]`) as File | null;
            let imageUrl = validatedData.imagesMeta[i].imageUrl;

            if (imageFile) {
              try {
                imageUrl = await uploadProductImage(imageFile);
                logger.info(`Product image uploaded successfully: ${imageUrl}`);
              } catch (error) {
                if (error instanceof FileUploadError) {
                  throw new BadRequestError(error.message);
                }
                throw error;
              }
            }

            if (!imageUrl) {
              throw new BadRequestError(
                "Each image entry must include an imageUrl or upload a file",
              );
            }

            uploadedImages.push({
              imageUrl,
              position:
                validatedData.imagesMeta[i].position !== undefined
                  ? validatedData.imagesMeta[i].position
                  : i,
            });
          }
        }

        const data =
          (c.get("validatedBody") as UpdateProductInput | undefined) ??
          updateProductSchema.parse({
            title: validatedData.title,
            description: validatedData.description,
            overview: validatedData.overview,
            productLink: validatedData.productLink,
            tagIds: validatedData.tagIds,
            images:
              validatedData.imagesMeta !== undefined
                ? uploadedImages
                : undefined,
          });

        const product = await service.updateProduct(id, data);
        return successResponse(c, product);
      } catch (error) {
        logger.error("Error updating product", error as Error);
        throw error;
      }
    }

    const data =
      (c.get("validatedBody") as UpdateProductInput | undefined) ??
      updateProductSchema.parse(await c.req.json());
    const product = await service.updateProduct(id, data);
    return successResponse(c, product);
  },

  async deleteProduct(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) throw new ValidationError("Invalid product ID");
    const result = await service.deleteProduct(id);
    return successResponse(c, result);
  },

  async listPublicProducts(c: Context) {
    const query =
      (c.get("validatedQuery") as PublicProductQuery | undefined) ??
      publicProductQuerySchema.parse(c.req.query());
    const result = await service.getPublicProducts(query);
    return paginatedResponse(c, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  async getPublicProductBySlug(c: Context) {
    const slug = c.req.param("slug");
    const product = await service.getPublicProductBySlug(slug);
    return successResponse(c, product);
  },
});

export type ProductController = ReturnType<typeof createProductController>;
