import type { Context } from "hono";

import type { GalleryCategoryService } from "./service";
import {
  createGalleryCategorySchema,
  galleryCategoryQuerySchema,
  publicGalleryCategoryQuerySchema,
  updateGalleryCategorySchema,
  type CreateGalleryCategoryInput,
  type GalleryCategoryIdParams,
  type GalleryCategoryQuery,
  type PublicGalleryCategoryQuery,
  type UpdateGalleryCategoryInput,
} from "./validators";
import {
  ValidationError,
  paginatedResponse,
  successResponse,
} from "../../core/http";

export const createGalleryCategoryController = (
  service: GalleryCategoryService,
) => {
  return {
    async listGalleryCategories(c: Context) {
      const query =
        (c.get("validatedQuery") as GalleryCategoryQuery | undefined) ??
        galleryCategoryQuerySchema.parse(c.req.query());

      const result = await service.getGalleryCategories(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getGalleryCategory(c: Context) {
      const { id } =
        (c.get("validatedParams") as GalleryCategoryIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid gallery category ID");
          }
          return { id: parsed };
        })();

      const category = await service.getGalleryCategoryById(id);
      return successResponse(c, category);
    },

    async createGalleryCategory(c: Context) {
      const data =
        (c.get("validatedBody") as CreateGalleryCategoryInput | undefined) ??
        createGalleryCategorySchema.parse(await c.req.json());

      const category = await service.createGalleryCategory(data);
      return successResponse(c, category, 201);
    },

    async updateGalleryCategory(c: Context) {
      const { id } =
        (c.get("validatedParams") as GalleryCategoryIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid gallery category ID");
          }
          return { id: parsed };
        })();

      const data =
        (c.get("validatedBody") as UpdateGalleryCategoryInput | undefined) ??
        updateGalleryCategorySchema.parse(await c.req.json());

      const category = await service.updateGalleryCategory(id, data);
      return successResponse(c, category);
    },

    async deleteGalleryCategory(c: Context) {
      const { id } =
        (c.get("validatedParams") as GalleryCategoryIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid gallery category ID");
          }
          return { id: parsed };
        })();

      await service.deleteGalleryCategory(id);
      return successResponse(c, {
        message: "Gallery category deleted successfully",
      });
    },

    async listPublicGalleryCategories(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicGalleryCategoryQuery | undefined) ??
        publicGalleryCategoryQuerySchema.parse(c.req.query());

      const result = await service.getPublicGalleryCategories(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },
  };
};

export type GalleryCategoryController = ReturnType<
  typeof createGalleryCategoryController
>;
