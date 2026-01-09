import type { TagRepository } from "./repository";
import type {
  CreateTagInput,
  UpdateTagInput,
  TagQuery,
  PublicTagQuery,
} from "./validators";
import { NotFoundError, ConflictError } from "../../core/http";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

export const createTagService = (repository: TagRepository) => {
  return {
    async getTags(query: TagQuery) {
      return await repository.findAll(query);
    },

    async getTagById(id: number) {
      const tag = await repository.findById(id);
      if (!tag) {
        throw new NotFoundError(`Tag with id ${id} not found`);
      }
      return tag;
    },

    async createTag(data: CreateTagInput) {
      try {
        return await repository.create(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          if (error.message.includes("name")) {
            throw new ConflictError(
              `Tag with name "${data.name}" already exists`,
            );
          }
          if (error.message.includes("slug")) {
            throw new ConflictError(
              `Tag with slug "${data.slug}" already exists`,
            );
          }
          throw new ConflictError("Tag with this name or slug already exists");
        }
        throw error;
      }
    },

    async updateTag(id: number, data: UpdateTagInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Tag with id ${id} not found`);
      }

      const enrichedData: UpdateTagInput & { slug?: string } = { ...data };

      // Regenerate slug only if name changed
      if (data.name && data.name !== existing.name) {
        enrichedData.slug = await ensureUniqueSlug(
          generateSlug(data.name),
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
          if (error.message.includes("name") && data.name) {
            throw new ConflictError(
              `Tag with name "${data.name}" already exists`,
            );
          }
          throw new ConflictError("Tag with this name already exists");
        }
        throw error;
      }
    },

    async deleteTag(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Tag with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicTags(query: PublicTagQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 100),
      };
      return await repository.findAllPublic(clampedQuery);
    },
  };
};

export type TagService = ReturnType<typeof createTagService>;
