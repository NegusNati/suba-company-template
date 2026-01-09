import type { Context } from "hono";

import type { GalleryService } from "./service";
import {
  createGalleryItemSchema,
  createGalleryFormSchema,
  updateGalleryItemSchema,
  updateGalleryFormSchema,
  galleryQuerySchema,
  publicGalleryQuerySchema,
  type GalleryQuery,
  type PublicGalleryQuery,
  type GalleryIdParams,
  type CreateGalleryItemInput,
  type UpdateGalleryItemInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadGalleryImage,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

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

        // Parse form data
        const formInput = {
          title: formData.get("title"),
          description: formData.get("description"),
          occurredAt: formData.get("occurredAt"),
          image: formData.get("image"),
        };

        // Validate form data
        const validatedData = createGalleryFormSchema.parse(formInput);

        // Handle file upload if provided
        let imageUrl: string | undefined;
        if (validatedData.image) {
          try {
            imageUrl = await uploadGalleryImage(validatedData.image);
            logger.info(`Gallery image uploaded successfully: ${imageUrl}`);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        // Prepare gallery data for service
        const itemData =
          (c.get("validatedBody") as CreateGalleryItemInput | undefined) ??
          createGalleryItemSchema.parse({
            title: validatedData.title,
            description: validatedData.description,
            occurredAt: validatedData.occurredAt,
            imageUrl,
          });

        logger.info("Creating gallery item with data", {
          title: itemData.title,
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
            image: formData.get("image"),
            imageUrl: formData.get("imageUrl"),
          };

          const validatedData = updateGalleryFormSchema.parse(formInput);

          let imageUrl = validatedData.imageUrl;
          if (validatedData.image) {
            try {
              imageUrl = await uploadGalleryImage(validatedData.image);
              logger.info(`Gallery image uploaded successfully: ${imageUrl}`);
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          const data =
            (c.get("validatedBody") as UpdateGalleryItemInput | undefined) ??
            updateGalleryItemSchema.parse({
              title: validatedData.title,
              description: validatedData.description,
              occurredAt: validatedData.occurredAt,
              imageUrl,
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
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
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
      });
    },
  };
};

export type GalleryController = ReturnType<typeof createGalleryController>;
