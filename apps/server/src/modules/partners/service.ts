import type { PartnerRepository } from "./repository";
import type {
  CreatePartnerInput,
  UpdatePartnerInput,
  PartnersQuery,
  PublicPartnersQuery,
} from "./validators";
import { NotFoundError, ConflictError } from "../../core/http";

export const createPartnerService = (repository: PartnerRepository) => {
  return {
    async getPartners(query: PartnersQuery) {
      return await repository.findAll(query);
    },

    async getPartner(id: number) {
      const partner = await repository.findById(id);

      if (!partner) {
        throw new NotFoundError(`Partner with id ${id} not found`);
      }

      return partner;
    },

    async createPartner(data: CreatePartnerInput) {
      try {
        return await repository.create(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new ConflictError(
            `Partner with slug "${data.slug}" already exists`,
          );
        }
        throw error;
      }
    },

    async updatePartner(id: number, data: UpdatePartnerInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Partner with id ${id} not found`);
      }

      try {
        return await repository.update(id, data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new ConflictError(
            `Partner with slug "${data.slug}" already exists`,
          );
        }
        throw error;
      }
    },

    async deletePartner(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Partner with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPartnerBySlug(slug: string) {
      const partner = await repository.findBySlug(slug);
      if (!partner) {
        throw new NotFoundError(`Partner with slug "${slug}" not found`);
      }
      return partner;
    },

    async getPublicPartners(query: PublicPartnersQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 100),
      };

      return await repository.findPublic(clampedQuery);
    },
  };
};

export type PartnerService = ReturnType<typeof createPartnerService>;
