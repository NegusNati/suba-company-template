import type { Context } from "hono";

import type { SocialService } from "./service";
import {
  socialQuerySchema,
  createSocialSchema,
  createSocialFormSchema,
  updateSocialSchema,
  updateSocialFormSchema,
  publicSocialQuerySchema,
  type SocialQuery,
  type PublicSocialQuery,
  type SocialIdParams,
  type CreateSocialInput,
  type UpdateSocialInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadSocialIcon,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createSocialController = (service: SocialService) => ({
  async listSocials(c: Context) {
    const query =
      (c.get("validatedQuery") as SocialQuery | undefined) ??
      socialQuerySchema.parse(c.req.query());
    const result = await service.getSocials(query);
    return paginatedResponse(c, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  async getSocial(c: Context) {
    const { id } =
      (c.get("validatedParams") as SocialIdParams | undefined) ??
      (() => {
        const parsed = Number.parseInt(c.req.param("id"));
        if (Number.isNaN(parsed))
          throw new ValidationError("Invalid social ID");
        return { id: parsed };
      })();

    const social = await service.getSocial(id);
    return successResponse(c, social);
  },

  async createSocial(c: Context) {
    logger.info("createSocial - handling multipart form data");
    try {
      const formData = await c.req.formData();
      const formInput = {
        title: formData.get("title"),
        baseUrl: formData.get("baseUrl"),
        icon: formData.get("icon"),
      };

      const validatedData = createSocialFormSchema.parse(formInput);
      let iconUrl: string | undefined;

      if (validatedData.icon) {
        try {
          iconUrl = await uploadSocialIcon(validatedData.icon);
          logger.info(`Social icon uploaded successfully: ${iconUrl}`);
        } catch (error) {
          if (error instanceof FileUploadError) {
            throw new BadRequestError(error.message);
          }
          throw error;
        }
      }

      const socialData =
        (c.get("validatedBody") as CreateSocialInput | undefined) ??
        createSocialSchema.parse({
          title: validatedData.title,
          baseUrl: validatedData.baseUrl,
          iconUrl,
        });

      const social = await service.createSocial(socialData);
      return successResponse(c, social, 201);
    } catch (error) {
      logger.error("Error creating social", error as Error);
      throw error;
    }
  },

  async updateSocial(c: Context) {
    const { id } =
      (c.get("validatedParams") as SocialIdParams | undefined) ??
      (() => {
        const parsed = Number.parseInt(c.req.param("id"));
        if (Number.isNaN(parsed))
          throw new ValidationError("Invalid social ID");
        return { id: parsed };
      })();

    const contentType = c.req.header("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      logger.info("updateSocial - handling multipart form data");
      try {
        const formData = await c.req.formData();
        const formInput = {
          title: formData.get("title"),
          baseUrl: formData.get("baseUrl"),
          icon: formData.get("icon"),
          iconUrl: formData.get("iconUrl"),
        };

        const validatedData = updateSocialFormSchema.parse(formInput);
        let iconUrl = validatedData.iconUrl;

        if (validatedData.icon) {
          try {
            iconUrl = await uploadSocialIcon(validatedData.icon);
            logger.info(`Social icon uploaded successfully: ${iconUrl}`);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const data =
          (c.get("validatedBody") as UpdateSocialInput | undefined) ??
          updateSocialSchema.parse({
            title: validatedData.title,
            baseUrl: validatedData.baseUrl,
            iconUrl,
          });

        const social = await service.updateSocial(id, data);
        return successResponse(c, social);
      } catch (error) {
        logger.error("Error updating social", error as Error);
        throw error;
      }
    }

    const data =
      (c.get("validatedBody") as UpdateSocialInput | undefined) ??
      updateSocialSchema.parse(await c.req.json());
    const social = await service.updateSocial(id, data);
    return successResponse(c, social);
  },

  async deleteSocial(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) throw new ValidationError("Invalid social ID");
    const result = await service.deleteSocial(id);
    return successResponse(c, result);
  },

  async listPublicSocials(c: Context) {
    const query =
      (c.get("validatedQuery") as PublicSocialQuery | undefined) ??
      publicSocialQuerySchema.parse(c.req.query());
    const result = await service.getPublicSocials(query);
    return paginatedResponse(c, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  async getPublicSocialByTitle(c: Context) {
    const title = c.req.param("title");
    const social = await service.getPublicSocialByTitle(title);
    return successResponse(c, social);
  },
});

export type SocialController = ReturnType<typeof createSocialController>;
