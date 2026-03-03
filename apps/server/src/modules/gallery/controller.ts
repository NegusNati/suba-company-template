import type { Context } from "hono";

import type { GalleryService } from "./service";
import {
  createGalleryFormSchema,
  createGalleryItemSchema,
  galleryQuerySchema,
  publicGalleryQuerySchema,
  updateGalleryFormSchema,
  updateGalleryItemSchema,
  type CreateGalleryItemInput,
  type GalleryIdParams,
  type GalleryImageMetaInput,
  type GalleryQuery,
  type PublicGalleryQuery,
  type UpdateGalleryItemInput,
} from "./validators";
import {
  BadRequestError,
  ValidationError,
  paginatedResponse,
  successResponse,
} from "../../core/http";
import {
  FileUploadError,
  uploadGalleryImage,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

const resolveImageUrls = async (
  formData: FormData,
  imagesMeta: GalleryImageMetaInput[],
) => {
  const resolved = await Promise.all(
    imagesMeta.map(async (meta, index) => {
      const file = formData.get(`images[${index}]`);
      if (file instanceof File) {
        try {
          const imageUrl = await uploadGalleryImage(file);
          return {
            position: meta.position,
            imageUrl,
          };
        } catch (error) {
          if (error instanceof FileUploadError) {
            throw new BadRequestError(error.message);
          }

          throw error;
        }
      }

      if (!meta.imageUrl) {
        throw new BadRequestError(
          "Each image entry must include imageUrl or an uploaded file",
        );
      }

      return {
        position: meta.position,
        imageUrl: meta.imageUrl,
      };
    }),
  );

  return resolved
    .toSorted((a, b) => a.position - b.position)
    .map((item) => item.imageUrl);
};

export const createGalleryController = (service: GalleryService) => {
  return {
    async listGalleryItems(c: Context) {
      const query =
        (c.get("validatedQuery") as GalleryQuery | undefined) ??
        galleryQuerySchema.parse(c.req.query());

      const result = await service.getGalleryItems(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getGalleryItem(c: Context) {
      const { id } =
        (c.get("validatedParams") as GalleryIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid gallery item ID");
          }

          return { id: parsed };
        })();

      const item = await service.getGalleryItem(id);
      return successResponse(c, item);
    },

    async createGalleryItem(c: Context) {
      logger.info("createGalleryItem - handling multipart form data");
      try {
        const formData = await c.req.formData();

        const formInput = {
          title: formData.get("title"),
          description: formData.get("description"),
          occurredAt: formData.get("occurredAt"),
          categoryId: formData.get("categoryId"),
          imagesMeta: formData.get("imagesMeta"),
        };

        const validatedData = createGalleryFormSchema.parse(formInput);
        const imageUrls = await resolveImageUrls(
          formData,
          validatedData.imagesMeta,
        );

        const itemData =
          (c.get("validatedBody") as CreateGalleryItemInput | undefined) ??
          createGalleryItemSchema.parse({
            title: validatedData.title,
            description: validatedData.description,
            occurredAt: validatedData.occurredAt,
            categoryId: validatedData.categoryId,
            imageUrls,
          });

        const item = await service.createGalleryItem(itemData);
        return successResponse(c, item, 201);
      } catch (error) {
        logger.error("Error creating gallery item", error as Error);
        throw error;
      }
    },

    async updateGalleryItem(c: Context) {
      const { id } =
        (c.get("validatedParams") as GalleryIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid gallery item ID");
          }

          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updateGalleryItem - handling multipart form data");
        try {
          const formData = await c.req.formData();

          const formInput = {
            title: formData.get("title"),
            description: formData.get("description"),
            occurredAt: formData.get("occurredAt"),
            categoryId: formData.get("categoryId"),
            imagesMeta: formData.get("imagesMeta"),
          };

          const validatedData = updateGalleryFormSchema.parse(formInput);
          const imageUrls =
            validatedData.imagesMeta !== undefined
              ? await resolveImageUrls(formData, validatedData.imagesMeta)
              : undefined;

          const data =
            (c.get("validatedBody") as UpdateGalleryItemInput | undefined) ??
            updateGalleryItemSchema.parse({
              title: validatedData.title,
              description: validatedData.description,
              occurredAt: validatedData.occurredAt,
              categoryId: validatedData.categoryId,
              imageUrls,
            });

          const item = await service.updateGalleryItem(id, data);
          return successResponse(c, item);
        } catch (error) {
          logger.error("Error updating gallery item", error as Error);
          throw error;
        }
      }

      const data =
        (c.get("validatedBody") as UpdateGalleryItemInput | undefined) ??
        updateGalleryItemSchema.parse(await c.req.json());

      const item = await service.updateGalleryItem(id, data);
      return successResponse(c, item);
    },

    async deleteGalleryItem(c: Context) {
      const id = Number.parseInt(c.req.param("id"), 10);
      if (Number.isNaN(id)) {
        throw new ValidationError("Invalid gallery item ID");
      }

      await service.deleteGalleryItem(id);
      return successResponse(c, {
        message: "Gallery item deleted successfully",
      });
    },

    async listPublicGalleryItems(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicGalleryQuery | undefined) ??
        publicGalleryQuerySchema.parse(c.req.query());

      const result = await service.getPublicGalleryItems(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        nextCursor: result.nextCursor,
      });
    },
  };
};

export type GalleryController = ReturnType<typeof createGalleryController>;
