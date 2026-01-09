import type { Context } from "hono";

import type { PartnerService } from "./service";
import {
  createPartnerSchema,
  createPartnerFormSchema,
  updatePartnerSchema,
  updatePartnerFormSchema,
  partnersQuerySchema,
  publicPartnersQuerySchema,
  type PartnersQuery,
  type PublicPartnersQuery,
  type PartnerIdParams,
  type CreatePartnerInput,
  type UpdatePartnerInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadPartnerLogo,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createPartnerController = (service: PartnerService) => {
  return {
    async listPartners(c: Context) {
      const query =
        (c.get("validatedQuery") as PartnersQuery | undefined) ??
        partnersQuerySchema.parse(c.req.query());

      const result = await service.getPartners(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getPartner(c: Context) {
      const { id } =
        (c.get("validatedParams") as PartnerIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid partner ID");
          }
          return { id: parsed };
        })();

      const partner = await service.getPartner(id);
      return successResponse(c, partner);
    },

    async createPartner(c: Context) {
      logger.info("createPartner - handling multipart form data");
      try {
        const formData = await c.req.formData();

        const formInput = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          description: formData.get("description"),
          websiteUrl: formData.get("websiteUrl"),
          logo: formData.get("logo"),
        };

        const validatedData = createPartnerFormSchema.parse(formInput);

        let logoUrl: string | undefined;
        if (validatedData.logo) {
          try {
            logoUrl = await uploadPartnerLogo(validatedData.logo);
            logger.info(`Partner logo uploaded successfully: ${logoUrl}`);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const partnerData =
          (c.get("validatedBody") as CreatePartnerInput | undefined) ??
          createPartnerSchema.parse({
            title: validatedData.title,
            slug: validatedData.slug,
            description: validatedData.description,
            websiteUrl: validatedData.websiteUrl,
            logoUrl,
          });

        logger.info("Creating partner with data", { title: partnerData.title });
        const partner = await service.createPartner(partnerData);
        return successResponse(c, partner, 201);
      } catch (error) {
        logger.error("Error creating partner", error as Error);
        throw error;
      }
    },

    async updatePartner(c: Context) {
      const { id } =
        (c.get("validatedParams") as PartnerIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid partner ID");
          }
          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updatePartner - handling multipart form data");
        try {
          const formData = await c.req.formData();

          const formInput = {
            title: formData.get("title"),
            slug: formData.get("slug"),
            description: formData.get("description"),
            websiteUrl: formData.get("websiteUrl"),
            logo: formData.get("logo"),
            logoUrl: formData.get("logoUrl"),
          };

          const validatedData = updatePartnerFormSchema.parse(formInput);

          let logoUrl = validatedData.logoUrl;
          if (validatedData.logo) {
            try {
              logoUrl = await uploadPartnerLogo(validatedData.logo);
              logger.info(`Partner logo uploaded successfully: ${logoUrl}`);
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          const data =
            (c.get("validatedBody") as UpdatePartnerInput | undefined) ??
            updatePartnerSchema.parse({
              title: validatedData.title,
              slug: validatedData.slug,
              description: validatedData.description,
              websiteUrl: validatedData.websiteUrl,
              logoUrl,
            });

          const partner = await service.updatePartner(id, data);
          return successResponse(c, partner);
        } catch (error) {
          logger.error("Error updating partner", error as Error);
          throw error;
        }
      }

      const data =
        (c.get("validatedBody") as UpdatePartnerInput | undefined) ??
        updatePartnerSchema.parse(await c.req.json());

      const partner = await service.updatePartner(id, data);
      return successResponse(c, partner);
    },

    async deletePartner(c: Context) {
      const { id } =
        (c.get("validatedParams") as PartnerIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid partner ID");
          }
          return { id: parsed };
        })();

      await service.deletePartner(id);
      return successResponse(c, { message: "Partner deleted successfully" });
    },

    async listPublicPartners(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicPartnersQuery | undefined) ??
        publicPartnersQuerySchema.parse(c.req.query());

      const result = await service.getPublicPartners(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getPartnerBySlug(c: Context) {
      const slug = c.req.param("slug");
      const partner = await service.getPartnerBySlug(slug);
      return successResponse(c, partner);
    },
  };
};

export type PartnerController = ReturnType<typeof createPartnerController>;
