import type { SocialRepository } from "./repository";
import type {
  SocialQuery,
  CreateSocialInput,
  UpdateSocialInput,
  PublicSocialQuery,
} from "./validators";
import { NotFoundError, ConflictError } from "../../core/http";

export const createSocialService = (repository: SocialRepository) => ({
  async getSocials(query: SocialQuery) {
    return repository.findAll(query);
  },

  async getSocial(id: number) {
    const social = await repository.findById(id);
    if (!social) throw new NotFoundError(`Social platform ${id} not found`);
    return social;
  },

  async createSocial(data: CreateSocialInput) {
    try {
      return await repository.create(data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ConflictError(
          `Social platform with title "${data.title}" already exists`,
        );
      }
      throw error;
    }
  },

  async updateSocial(id: number, data: UpdateSocialInput) {
    const existing = await repository.findById(id);
    if (!existing) throw new NotFoundError(`Social platform ${id} not found`);

    try {
      return await repository.update(id, data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ConflictError("Social platform title already exists");
      }
      throw error;
    }
  },

  async deleteSocial(id: number) {
    const existing = await repository.findById(id);
    if (!existing) throw new NotFoundError(`Social platform ${id} not found`);
    await repository.delete(id);
    return { message: "Social platform deleted" };
  },

  async getPublicSocials(query: PublicSocialQuery) {
    const clampedQuery = {
      ...query,
      limit: Math.min(query.limit, 50),
    };
    return repository.findPublicList(clampedQuery);
  },

  async getPublicSocialByTitle(title: string) {
    const social = await repository.findByTitle(title);
    if (!social) throw new NotFoundError(`Social platform not found`);
    return social;
  },
});

export type SocialService = ReturnType<typeof createSocialService>;
