import type { FaqRepository } from "./repository";
import type {
  CreateFaqInput,
  UpdateFaqInput,
  FaqQuery,
  PublicFaqQuery,
} from "./validators";
import { NotFoundError } from "../../core/http";

export const createFaqService = (repository: FaqRepository) => {
  return {
    async getFaqs(query: FaqQuery) {
      return await repository.findAll(query);
    },

    async getFaqById(id: number) {
      const faq = await repository.findById(id);

      if (!faq) {
        throw new NotFoundError(`FAQ with id ${id} not found`);
      }

      return faq;
    },

    async createFaq(data: CreateFaqInput) {
      return await repository.create(data);
    },

    async updateFaq(id: number, data: UpdateFaqInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`FAQ with id ${id} not found`);
      }

      return await repository.update(id, data);
    },

    async deleteFaq(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`FAQ with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicFaqs(query: PublicFaqQuery) {
      // Ensure limit is capped at 50
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 50),
      };

      return await repository.findPublic(clampedQuery);
    },
  };
};

export type FaqService = ReturnType<typeof createFaqService>;
