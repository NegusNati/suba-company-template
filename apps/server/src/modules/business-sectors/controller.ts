import type { Context } from "hono";

import type { BusinessSectorService } from "./service";
import {
  businessSectorQuerySchema,
  businessSectorIdParamSchema,
  createBusinessSectorFormSchema,
  createBusinessSectorSchema,
  publicBusinessSectorQuerySchema,
  updateBusinessSectorFormSchema,
  updateBusinessSectorSchema,
  type BusinessSectorIdParams,
  type BusinessSectorQuery,
  type CreateBusinessSectorInput,
  type PublicBusinessSectorQuery,
  type UpdateBusinessSectorInput,
} from "./validators";
import {
  BadRequestError,
  paginatedResponse,
  successResponse,
  ValidationError,
} from "../../core/http";
import {
  FileUploadError,
  uploadBusinessSectorGalleryImage,
  uploadBusinessSectorImage,
  uploadBusinessSectorServiceImage,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

const resolveServicePayload = async (
  formData: FormData,
  servicesMeta: Array<{
    title: string;
    description?: string;
    imageUrl?: string;
    position?: number;
  }>,
) => {
  const resolved = [] as Array<{
    title: string;
    description?: string;
    imageUrl?: string;
    position: number;
  }>;

  for (let i = 0; i < servicesMeta.length; i++) {
    const meta = servicesMeta[i];
    if (!meta) continue;

    const uploaded = formData.get(`services[${i}]`);
    let imageUrl = meta.imageUrl;

    if (uploaded instanceof File) {
      try {
        imageUrl = await uploadBusinessSectorServiceImage(uploaded);
      } catch (error) {
        if (error instanceof FileUploadError) {
          throw new BadRequestError(error.message);
        }
        throw error;
      }
    }

    resolved.push({
      title: meta.title,
      description: meta.description,
      imageUrl,
      position: meta.position ?? i,
    });
  }

  return resolved;
};

const resolveGalleryPayload = async (
  formData: FormData,
  galleryMeta: Array<{ imageUrl?: string; position?: number }>,
) => {
  const resolved = [] as Array<{ imageUrl: string; position: number }>;

  for (let i = 0; i < galleryMeta.length; i++) {
    const meta = galleryMeta[i];
    if (!meta) continue;

    const uploaded = formData.get(`gallery[${i}]`);
    let imageUrl = meta.imageUrl;

    if (uploaded instanceof File) {
      try {
        imageUrl = await uploadBusinessSectorGalleryImage(uploaded);
      } catch (error) {
        if (error instanceof FileUploadError) {
          throw new BadRequestError(error.message);
        }
        throw error;
      }
    }

    if (!imageUrl) {
      throw new BadRequestError(
        "Each gallery entry must include imageUrl or upload a file",
      );
    }

    resolved.push({
      imageUrl,
      position: meta.position ?? i,
    });
  }

  return resolved;
};

export const createBusinessSectorController = (
  service: BusinessSectorService,
) => {
  return {
    async listBusinessSectors(c: Context) {
      const query =
        (c.get("validatedQuery") as BusinessSectorQuery | undefined) ??
        businessSectorQuerySchema.parse(c.req.query());

      const result = await service.getBusinessSectors(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getBusinessSector(c: Context) {
      const { id } =
        (c.get("validatedParams") as BusinessSectorIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"), 10);
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid business sector ID");
          }
          return { id: parsed };
        })();

      const sector = await service.getBusinessSectorById(id);
      return successResponse(c, sector);
    },

    async getBusinessSectorBySlug(c: Context) {
      const slug = c.req.param("slug");
      const sector = await service.getBusinessSectorBySlug(slug);
      return successResponse(c, sector);
    },

    async createBusinessSector(c: Context) {
      logger.info("createBusinessSector - handling multipart form data");
      try {
        const formData = await c.req.formData();

        const formInput = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          excerpt: formData.get("excerpt"),
          history: formData.get("history"),
          featuredImageUrl: formData.get("featuredImageUrl"),
          phoneNumber: formData.get("phoneNumber"),
          emailAddress: formData.get("emailAddress"),
          address: formData.get("address"),
          facebookUrl: formData.get("facebookUrl"),
          instagramUrl: formData.get("instagramUrl"),
          linkedinUrl: formData.get("linkedinUrl"),
          publishDate: formData.get("publishDate"),
          stats: formData.get("stats"),
          servicesMeta: formData.get("servicesMeta"),
          galleryMeta: formData.get("galleryMeta"),
        };

        const validatedData = createBusinessSectorFormSchema.parse(formInput);

        let featuredImageUrl = validatedData.featuredImageUrl;
        const featuredImageFile = formData.get("featuredImage");
        if (featuredImageFile instanceof File) {
          try {
            featuredImageUrl =
              await uploadBusinessSectorImage(featuredImageFile);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const resolvedServices = validatedData.servicesMeta
          ? await resolveServicePayload(formData, validatedData.servicesMeta)
          : undefined;
        const resolvedGallery = validatedData.galleryMeta
          ? await resolveGalleryPayload(formData, validatedData.galleryMeta)
          : undefined;

        const payload: CreateBusinessSectorInput =
          (c.get("validatedBody") as CreateBusinessSectorInput | undefined) ??
          createBusinessSectorSchema.parse({
            title: validatedData.title,
            slug: validatedData.slug,
            excerpt: validatedData.excerpt,
            history: validatedData.history,
            featuredImageUrl,
            phoneNumber: validatedData.phoneNumber,
            emailAddress: validatedData.emailAddress,
            address: validatedData.address,
            facebookUrl: validatedData.facebookUrl,
            instagramUrl: validatedData.instagramUrl,
            linkedinUrl: validatedData.linkedinUrl,
            publishDate: validatedData.publishDate,
            stats: validatedData.stats,
            services: resolvedServices,
            gallery: resolvedGallery,
          });

        const result = await service.createBusinessSector(payload);
        return successResponse(c, result, 201);
      } catch (error) {
        logger.error("Error creating business sector", error as Error);
        throw error;
      }
    },

    async updateBusinessSector(c: Context) {
      const { id } =
        (c.get("validatedParams") as BusinessSectorIdParams | undefined) ??
        businessSectorIdParamSchema.parse(c.req.param());

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updateBusinessSector - handling multipart form data");

        const formData = await c.req.formData();
        const formInput = {
          title: formData.get("title"),
          excerpt: formData.get("excerpt"),
          history: formData.get("history"),
          featuredImageUrl: formData.get("featuredImageUrl"),
          phoneNumber: formData.get("phoneNumber"),
          emailAddress: formData.get("emailAddress"),
          address: formData.get("address"),
          facebookUrl: formData.get("facebookUrl"),
          instagramUrl: formData.get("instagramUrl"),
          linkedinUrl: formData.get("linkedinUrl"),
          publishDate: formData.get("publishDate"),
          stats: formData.get("stats"),
          servicesMeta: formData.get("servicesMeta"),
          galleryMeta: formData.get("galleryMeta"),
        };

        const validatedData = updateBusinessSectorFormSchema.parse(formInput);

        let featuredImageUrl = validatedData.featuredImageUrl;
        const featuredImageFile = formData.get("featuredImage");
        if (featuredImageFile instanceof File) {
          try {
            featuredImageUrl =
              await uploadBusinessSectorImage(featuredImageFile);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const resolvedServices =
          validatedData.servicesMeta !== undefined
            ? await resolveServicePayload(formData, validatedData.servicesMeta)
            : undefined;

        const resolvedGallery =
          validatedData.galleryMeta !== undefined
            ? await resolveGalleryPayload(formData, validatedData.galleryMeta)
            : undefined;

        const payload: UpdateBusinessSectorInput =
          (c.get("validatedBody") as UpdateBusinessSectorInput | undefined) ??
          updateBusinessSectorSchema.parse({
            title: validatedData.title,
            excerpt: validatedData.excerpt,
            history: validatedData.history,
            featuredImageUrl,
            phoneNumber: validatedData.phoneNumber,
            emailAddress: validatedData.emailAddress,
            address: validatedData.address,
            facebookUrl: validatedData.facebookUrl,
            instagramUrl: validatedData.instagramUrl,
            linkedinUrl: validatedData.linkedinUrl,
            publishDate: validatedData.publishDate,
            stats: validatedData.stats,
            services: resolvedServices,
            gallery: resolvedGallery,
          });

        const result = await service.updateBusinessSector(id, payload);
        return successResponse(c, result);
      }

      const body =
        (c.get("validatedBody") as UpdateBusinessSectorInput | undefined) ??
        updateBusinessSectorSchema.parse(await c.req.json());

      const result = await service.updateBusinessSector(id, body);
      return successResponse(c, result);
    },

    async deleteBusinessSector(c: Context) {
      const { id } =
        (c.get("validatedParams") as BusinessSectorIdParams | undefined) ??
        businessSectorIdParamSchema.parse(c.req.param());

      const result = await service.deleteBusinessSector(id);
      return successResponse(c, result);
    },

    async listPublicBusinessSectors(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicBusinessSectorQuery | undefined) ??
        publicBusinessSectorQuerySchema.parse(c.req.query());

      const result = await service.getPublicBusinessSectors(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getPublicBusinessSectorById(c: Context) {
      const { id } =
        (c.get("validatedParams") as BusinessSectorIdParams | undefined) ??
        businessSectorIdParamSchema.parse(c.req.param());

      const sector = await service.getPublicBusinessSectorById(id);
      return successResponse(c, sector);
    },

    async getPublicBusinessSectorBySlug(c: Context) {
      const slug = c.req.param("slug");
      const sector = await service.getPublicBusinessSectorBySlug(slug);
      return successResponse(c, sector);
    },
  };
};

export type BusinessSectorController = ReturnType<
  typeof createBusinessSectorController
>;
