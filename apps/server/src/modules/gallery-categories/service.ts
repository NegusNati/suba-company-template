import type { GalleryCategoryRepository } from "./repository";
import type {
  CreateGalleryCategoryInput,
  GalleryCategoryQuery,
  PublicGalleryCategoryQuery,
  UpdateGalleryCategoryInput,
} from "./validators";
import { BadRequestError, ConflictError, NotFoundError } from "../../core/http";
import { ensureUniqueSlug, generateSlug } from "../../shared/utils/slug";

export const createGalleryCategoryService = (
  repository: GalleryCategoryRepository,
) => {
  return {
    async getGalleryCategories(query: GalleryCategoryQuery) {
      return repository.findAll(query);
    },

    async getGalleryCategoryById(id: number) {
      const category = await repository.findById(id);
      if (!category) {
        throw new NotFoundError(`Gallery category with id ${id} not found`);
      }

      const itemCount = await repository.countItems(id);
      return { ...category, itemCount };
    },

    async createGalleryCategory(data: CreateGalleryCategoryInput) {
      const slug =
        data.slug ||
        (await ensureUniqueSlug(generateSlug(data.name), async (candidate) => {
          const existing = await repository.findBySlug(candidate);
          return Boolean(existing);
        }));

      try {
        return await repository.create({ ...data, slug });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("unique")
        ) {
          throw new ConflictError(
            "Gallery category name or slug already exists",
          );
        }

        throw error;
      }
    },

    async updateGalleryCategory(id: number, data: UpdateGalleryCategoryInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Gallery category with id ${id} not found`);
      }

      if (existing.isSystem) {
        throw new BadRequestError("System categories cannot be modified");
      }

      const payload: UpdateGalleryCategoryInput & { slug?: string } = {
        ...data,
      };

      if (data.name && data.name !== existing.name) {
        payload.slug = await ensureUniqueSlug(
          generateSlug(data.name),
          async (s) => {
            const found = await repository.findBySlug(s);
            return Boolean(found && found.id !== id);
          },
        );
      }

      try {
        const updated = await repository.update(id, payload);
        if (!updated) {
          throw new NotFoundError(`Gallery category with id ${id} not found`);
        }
        return updated;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("unique")
        ) {
          throw new ConflictError("Gallery category name already exists");
        }

        throw error;
      }
    },

    async deleteGalleryCategory(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Gallery category with id ${id} not found`);
      }

      if (existing.isSystem) {
        throw new BadRequestError("System categories cannot be deleted");
      }

      const uncategorized = await repository.findUncategorized();
      if (!uncategorized) {
        throw new BadRequestError(
          "Uncategorized category is missing. Cannot safely reassign entries.",
        );
      }

      const deleted = await repository.reassignItemsAndDelete(
        id,
        uncategorized.id,
      );
      if (!deleted) {
        throw new NotFoundError(`Gallery category with id ${id} not found`);
      }

      return deleted;
    },

    async getPublicGalleryCategories(query: PublicGalleryCategoryQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 100),
      };

      return repository.findAllPublic(clampedQuery);
    },
  };
};

export type GalleryCategoryService = ReturnType<
  typeof createGalleryCategoryService
>;
