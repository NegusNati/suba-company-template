import type { Context } from "hono";

import type { ServiceService } from "./service";
import {
  createServiceSchema,
  createServiceFormSchema,
  updateServiceSchema,
  updateServiceFormSchema,
  serviceQuerySchema,
  publicServiceQuerySchema,
  type ServiceQuery,
  type PublicServiceQuery,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadServiceImage,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createServiceController = (service: ServiceService) => {
  return {
    async listServices(c: Context) {
      const query =
        (c.get("validatedQuery") as ServiceQuery | undefined) ??
        serviceQuerySchema.parse(c.req.query());

      const result = await service.getServices(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getService(c: Context) {
      const id = parseInt(c.req.param("id"));
      const includeImages = c.req.query("includeImages") === "true";

      if (isNaN(id)) {
        throw new ValidationError("Invalid service ID");
      }

      const serviceData = await service.getService(id, includeImages);
      return successResponse(c, serviceData);
    },

    async createService(c: Context) {
      logger.info("createService - handling multipart form data");
      try {
        const formData = await c.req.formData();

        const formInput = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          excerpt: formData.get("excerpt"),
          description: formData.get("description"),
          imagesMeta: formData.get("imagesMeta"),
        };

        const validatedData = createServiceFormSchema.parse(formInput);

        // Collect all uploaded files
        const uploadedImages: Array<{ imageUrl: string; position: number }> =
          [];
        logger.info("before image");
        if (validatedData.imagesMeta && validatedData.imagesMeta.length > 0) {
          for (let i = 0; i < validatedData.imagesMeta.length; i++) {
            const imageFile = formData.get(`images[${i}]`) as File | null;
            if (imageFile) {
              try {
                const imageUrl = await uploadServiceImage(imageFile);
                logger.info(`Service image uploaded successfully: ${imageUrl}`);
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
        logger.info("after image");
        const serviceData = createServiceSchema.parse({
          title: validatedData.title,
          slug: validatedData.slug,
          excerpt: validatedData.excerpt,
          description: validatedData.description,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        });

        logger.info("Creating service with data", { title: serviceData.title });
        const result = await service.createService(serviceData);
        return successResponse(c, result, 201);
      } catch (error) {
        logger.error("Error creating service", error as Error);
        throw error;
      }
    },

    async updateService(c: Context) {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        throw new ValidationError("Invalid service ID");
      }

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updateService - handling multipart form data");
        try {
          const formData = await c.req.formData();

          const formInput = {
            title: formData.get("title"),
            excerpt: formData.get("excerpt"),
            description: formData.get("description"),
            imagesMeta: formData.get("imagesMeta"),
          };

          const validatedData = updateServiceFormSchema.parse(formInput);

          const uploadedImages: Array<{ imageUrl: string; position: number }> =
            [];

          if (validatedData.imagesMeta !== undefined) {
            for (let i = 0; i < validatedData.imagesMeta.length; i++) {
              const imageFile = formData.get(`images[${i}]`) as File | null;
              let imageUrl = validatedData.imagesMeta[i].imageUrl;

              if (imageFile) {
                try {
                  imageUrl = await uploadServiceImage(imageFile);
                  logger.info(
                    `Service image uploaded successfully: ${imageUrl}`,
                  );
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

          const data = updateServiceSchema.parse({
            title: validatedData.title,
            excerpt: validatedData.excerpt,
            description: validatedData.description,
            images:
              validatedData.imagesMeta !== undefined
                ? uploadedImages
                : undefined,
          });

          const serviceData = await service.updateService(id, data);
          return successResponse(c, serviceData);
        } catch (error) {
          logger.error("Error updating service", error as Error);
          throw error;
        }
      }

      const body = await c.req.json();
      const data = updateServiceSchema.parse(body);

      const serviceData = await service.updateService(id, data);
      return successResponse(c, serviceData);
    },

    async deleteService(c: Context) {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        throw new ValidationError("Invalid service ID");
      }

      await service.deleteService(id);
      return successResponse(c, {
        message: "Service deleted successfully",
      });
    },

    async listPublicServices(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicServiceQuery | undefined) ??
        publicServiceQuerySchema.parse(c.req.query());

      const result = await service.getPublicServices(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        nextCursor: result.nextCursor,
      });
    },

    async getPublicServiceBySlug(c: Context) {
      const slug = c.req.param("slug");

      const serviceData = await service.getPublicServiceBySlug(slug);
      return successResponse(c, serviceData);
    },
  };
};

export type ServiceController = ReturnType<typeof createServiceController>;
