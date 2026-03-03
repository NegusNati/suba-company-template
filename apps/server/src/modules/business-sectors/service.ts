import type { BusinessSectorRepository } from "./repository";
import type {
  BusinessSectorQuery,
  CreateBusinessSectorInput,
  PublicBusinessSectorQuery,
  UpdateBusinessSectorInput,
} from "./validators";
import { ConflictError, NotFoundError } from "../../core/http";
import { ensureUniqueSlug, generateSlug } from "../../shared/utils/slug";

export const createBusinessSectorService = (
  repository: BusinessSectorRepository,
) => {
  return {
    async getBusinessSectors(query: BusinessSectorQuery) {
      return repository.findAll(query);
    },

    async getBusinessSectorById(id: number) {
      const sector = await repository.findById(id);
      if (!sector) {
        throw new NotFoundError(`Business sector with id ${id} not found`);
      }
      return sector;
    },

    async getBusinessSectorBySlug(slug: string) {
      const sector = await repository.findBySlug(slug);
      if (!sector) {
        throw new NotFoundError(
          `Business sector with slug "${slug}" not found`,
        );
      }
      return sector;
    },

    async createBusinessSector(data: CreateBusinessSectorInput) {
      try {
        const created = await repository.create(data);
        if (!created) {
          throw new Error("Failed to create business sector");
        }
        return created;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("unique constraint")
        ) {
          throw new ConflictError(
            "Business sector with this slug already exists",
          );
        }
        throw error;
      }
    },

    async updateBusinessSector(id: number, data: UpdateBusinessSectorInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Business sector with id ${id} not found`);
      }

      const enriched: UpdateBusinessSectorInput & { slug?: string } = {
        ...data,
      };

      if (data.title && data.title !== existing.title) {
        enriched.slug = await ensureUniqueSlug(
          generateSlug(data.title),
          async (s) => {
            const found = await repository.findBySlug(s);
            return !!found && found.id !== id;
          },
        );
      }

      try {
        const updated = await repository.update(id, enriched);
        if (!updated) {
          throw new NotFoundError(`Business sector with id ${id} not found`);
        }
        return updated;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("unique constraint")
        ) {
          throw new ConflictError(
            "Business sector with this slug already exists",
          );
        }
        throw error;
      }
    },

    async deleteBusinessSector(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Business sector with id ${id} not found`);
      }

      await repository.delete(id);
      return { message: "Business sector deleted successfully" };
    },

    async getPublicBusinessSectors(query: PublicBusinessSectorQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 50),
      };
      return repository.findPublished(clampedQuery);
    },

    async getPublicBusinessSectorById(id: number) {
      const sector = await repository.findPublishedById(id);
      if (!sector) {
        throw new NotFoundError(
          `Published business sector with id ${id} not found`,
        );
      }
      return sector;
    },

    async getPublicBusinessSectorBySlug(slug: string) {
      const sector = await repository.findPublishedBySlug(slug);
      if (!sector) {
        throw new NotFoundError(
          `Published business sector with slug "${slug}" not found`,
        );
      }
      return sector;
    },
  };
};

export type BusinessSectorService = ReturnType<
  typeof createBusinessSectorService
>;
