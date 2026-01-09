import type { Context } from "hono";

import type { FaqService } from "./service";
import {
  createFaqSchema,
  updateFaqSchema,
  faqQuerySchema,
  publicFaqQuerySchema,
  type CreateFaqInput,
  type UpdateFaqInput,
  type FaqQuery,
  type PublicFaqQuery,
  type FaqIdParams,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
} from "../../core/http";

export const createFaqController = (service: FaqService) => {
  return {
    async listFaqs(c: Context) {
      const query =
        (c.get("validatedQuery") as FaqQuery | undefined) ??
        faqQuerySchema.parse(c.req.query());

      const result = await service.getFaqs(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getFaq(c: Context) {
      const { id } =
        (c.get("validatedParams") as FaqIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid FAQ ID");
          }
          return { id: parsed };
        })();

      const faq = await service.getFaqById(id);
      return successResponse(c, faq);
    },

    async createFaq(c: Context) {
      const data =
        (c.get("validatedBody") as CreateFaqInput | undefined) ??
        createFaqSchema.parse(await c.req.json());

      const faq = await service.createFaq(data);
      return successResponse(c, faq, 201);
    },

    async updateFaq(c: Context) {
      const { id } =
        (c.get("validatedParams") as FaqIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid FAQ ID");
          }
          return { id: parsed };
        })();

      const data =
        (c.get("validatedBody") as UpdateFaqInput | undefined) ??
        updateFaqSchema.parse(await c.req.json());

      const faq = await service.updateFaq(id, data);
      return successResponse(c, faq);
    },

    async deleteFaq(c: Context) {
      const { id } =
        (c.get("validatedParams") as FaqIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid FAQ ID");
          }
          return { id: parsed };
        })();

      await service.deleteFaq(id);
      return successResponse(c, { message: "FAQ deleted successfully" });
    },

    async listPublicFaqs(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicFaqQuery | undefined) ??
        publicFaqQuerySchema.parse(c.req.query());

      const result = await service.getPublicFaqs(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },
  };
};

export type FaqController = ReturnType<typeof createFaqController>;
