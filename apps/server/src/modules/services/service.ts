import type { ServiceRepository } from "./repository";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  ServiceQuery,
  PublicServiceQuery,
} from "./validators";
import { NotFoundError, ConflictError } from "../../core/http";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

export const createServiceService = (repository: ServiceRepository) => {
  return {
    async getServices(query: ServiceQuery) {
      return await repository.findAll(query);
    },

    async getService(id: number, includeImages = false) {
      const service = includeImages
        ? await repository.findWithImages(id)
        : await repository.findById(id);

      if (!service) {
        throw new NotFoundError(`Service with id ${id} not found`);
      }

      return service;
    },

    async createService(data: CreateServiceInput) {
      try {
        return await repository.create(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          if (error.message.includes("slug")) {
            throw new ConflictError(
              `Service with slug "${data.slug}" already exists`,
            );
          }
          throw new ConflictError("Service with this slug already exists");
        }
        throw error;
      }
    },

    async updateService(id: number, data: UpdateServiceInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Service with id ${id} not found`);
      }

      const enrichedData: UpdateServiceInput & { slug?: string } = {
        ...data,
      };

      if (data.title && data.title !== existing.title) {
        enrichedData.slug = await ensureUniqueSlug(
          generateSlug(data.title),
          async (s) => {
            const found = await repository.findBySlug(s);
            return !!found && found.id !== id;
          },
        );
      }

      try {
        return await repository.update(id, enrichedData);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new ConflictError("Service with this slug already exists");
        }
        throw error;
      }
    },

    async deleteService(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Service with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicServices(query: PublicServiceQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 50),
      };
      return await repository.findPublicList(clampedQuery);
    },

    async getPublicServiceBySlug(slug: string) {
      const service = await repository.findPublicBySlug(slug);
      if (!service) {
        throw new NotFoundError(`Service with slug "${slug}" not found`);
      }
      return service;
    },
  };
};

export type ServiceService = ReturnType<typeof createServiceService>;
