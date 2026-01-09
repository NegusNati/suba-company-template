import type { Context } from "hono";

import type { TagService } from "./service";
import {
  createTagSchema,
  updateTagSchema,
  tagQuerySchema,
  publicTagQuerySchema,
  type TagQuery,
  type PublicTagQuery,
  type TagIdParams,
  type CreateTagInput,
  type UpdateTagInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
} from "../../core/http";

export const createTagController = (service: TagService) => {
  return {
    async listTags(c: Context) {
      const query =
        (c.get("validatedQuery") as TagQuery | undefined) ??
        tagQuerySchema.parse(c.req.query());

      const result = await service.getTags(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getTag(c: Context) {
      const { id } =
        (c.get("validatedParams") as TagIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) throw new ValidationError("Invalid tag ID");
          return { id: parsed };
        })();

      const tag = await service.getTagById(id);
      return successResponse(c, tag);
    },

    async createTag(c: Context) {
      const data =
        (c.get("validatedBody") as CreateTagInput | undefined) ??
        createTagSchema.parse(await c.req.json());

      const tag = await service.createTag(data);
      return successResponse(c, tag, 201);
    },

    async updateTag(c: Context) {
      const { id } =
        (c.get("validatedParams") as TagIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) throw new ValidationError("Invalid tag ID");
          return { id: parsed };
        })();

      const data =
        (c.get("validatedBody") as UpdateTagInput | undefined) ??
        updateTagSchema.parse(await c.req.json());

      const tag = await service.updateTag(id, data);
      return successResponse(c, tag);
    },

    async deleteTag(c: Context) {
      const { id } =
        (c.get("validatedParams") as TagIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) throw new ValidationError("Invalid tag ID");
          return { id: parsed };
        })();

      await service.deleteTag(id);
      return successResponse(c, { message: "Tag deleted successfully" });
    },

    async listPublicTags(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicTagQuery | undefined) ??
        publicTagQuerySchema.parse(c.req.query());

      const result = await service.getPublicTags(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },
  };
};

export type TagController = ReturnType<typeof createTagController>;
