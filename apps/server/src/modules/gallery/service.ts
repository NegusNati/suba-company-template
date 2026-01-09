import type { GalleryRepository } from "./repository";
import type {
  CreateGalleryItemInput,
  UpdateGalleryItemInput,
  GalleryQuery,
  PublicGalleryQuery,
} from "./validators";
import { NotFoundError } from "../../core/http";

export const createGalleryService = (repository: GalleryRepository) => {
  return {
    async getGalleryItems(query: GalleryQuery) {
      return await repository.findAll(query);
    },

    async getGalleryItem(id: number) {
      const item = await repository.findById(id);
      if (!item) {
        throw new NotFoundError(`Gallery item with id ${id} not found`);
      }
      return item;
    },

    async createGalleryItem(data: CreateGalleryItemInput) {
      return await repository.create(data);
    },

    async updateGalleryItem(id: number, data: UpdateGalleryItemInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Gallery item with id ${id} not found`);
      }

      return await repository.update(id, data);
    },

    async deleteGalleryItem(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Gallery item with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicGalleryItems(query: PublicGalleryQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 50),
      };
      return await repository.findPublicList(clampedQuery);
    },
  };
};

export type GalleryService = ReturnType<typeof createGalleryService>;
