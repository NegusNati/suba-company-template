import type { BlogRepository } from "./repository";
import type { CreateBlogInput, UpdateBlogInput, BlogQuery } from "./validators";
import { NotFoundError } from "../../core/http";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

export const createBlogService = (repository: BlogRepository) => {
  return {
    async getBlogs(query: BlogQuery) {
      return await repository.findAll(query);
    },

    async getBlogById(id: number, includeTags = false) {
      const blog = includeTags
        ? await repository.findWithTags(id)
        : await repository.findById(id);

      if (!blog) {
        throw new NotFoundError(`Blog with id ${id} not found`);
      }

      return blog;
    },

    async getBlogBySlug(slug: string) {
      const blog = await repository.findBySlug(slug);
      if (!blog) {
        throw new NotFoundError(`Blog with slug "${slug}" not found`);
      }
      return blog;
    },

    async createBlog(data: CreateBlogInput) {
      return await repository.create(data);
    },

    async updateBlog(id: number, data: UpdateBlogInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Blog with id ${id} not found`);
      }

      const enrichedData: UpdateBlogInput & { slug?: string } = { ...data };

      // Regenerate slug only if title changed
      if (data.title && data.title !== existing.title) {
        enrichedData.slug = await ensureUniqueSlug(
          generateSlug(data.title),
          async (s) => {
            const found = await repository.findBySlug(s);
            return !!found && found.id !== id;
          },
        );
      }

      return await repository.update(id, enrichedData);
    },

    async deleteBlog(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Blog with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublishedBlogs(query: BlogQuery) {
      return await repository.findPublished(query);
    },

    async getPublishedBlogById(id: number) {
      const blog = await repository.findPublishedById(id);
      if (!blog) {
        throw new NotFoundError(`Published blog with id ${id} not found`);
      }
      return blog;
    },

    async getPublishedBlogBySlug(slug: string) {
      const blog = await repository.findPublishedBySlug(slug);
      if (!blog) {
        throw new NotFoundError(`Published blog with slug "${slug}" not found`);
      }
      return blog;
    },
  };
};

export type BlogService = ReturnType<typeof createBlogService>;
