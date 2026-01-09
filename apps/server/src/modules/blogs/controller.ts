import type { Context } from "hono";

import type { BlogService } from "./service";
import {
  createBlogSchema,
  createBlogFormSchema,
  updateBlogSchema,
  updateBlogFormSchema,
  blogQuerySchema,
  type BlogQuery,
  type BlogIdParams,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadBlogImage,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createBlogController = (service: BlogService) => {
  return {
    async listBlogs(c: Context) {
      const query =
        (c.get("validatedQuery") as BlogQuery | undefined) ??
        blogQuerySchema.parse(c.req.query());

      const result = await service.getBlogs(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getBlog(c: Context) {
      const { id } =
        (c.get("validatedParams") as BlogIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid blog ID");
          }
          return { id: parsed };
        })();
      const includeTags = c.req.query("includeTags") === "true";

      const blog = await service.getBlogById(id, includeTags);
      return successResponse(c, blog);
    },

    async getBlogBySlug(c: Context) {
      const slug = c.req.param("slug");
      const blog = await service.getBlogBySlug(slug);
      return successResponse(c, blog);
    },

    async createBlog(c: Context) {
      logger.info("createBlog - handling multipart form data");
      try {
        const formData = await c.req.formData();

        // Parse form data
        const formInput = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          excerpt: formData.get("excerpt"),
          content: formData.get("content"),
          authorId: formData.get("authorId"),
          publishDate: formData.get("publishDate"),
          readTimeMinutes: formData.get("readTimeMinutes"),
          tagIds: formData.get("tagIds"),
          featuredImage: formData.get("featuredImage"),
        };

        // Validate form data
        const validatedData = createBlogFormSchema.parse(formInput);

        // Handle file upload if provided
        let featuredImageUrl: string | undefined;
        if (validatedData.featuredImage) {
          try {
            featuredImageUrl = await uploadBlogImage(
              validatedData.featuredImage,
            );
            logger.info(`Image uploaded successfully: ${featuredImageUrl}`);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        // Prepare blog data for service
        const blogData = createBlogSchema.parse({
          title: validatedData.title,
          slug: validatedData.slug,
          excerpt: validatedData.excerpt,
          content: validatedData.content,
          authorId: validatedData.authorId,
          publishDate: validatedData.publishDate,
          readTimeMinutes: validatedData.readTimeMinutes,
          tagIds: validatedData.tagIds,
          featuredImageUrl,
        });

        logger.info("Creating blog with data", { title: blogData.title });
        const blog = await service.createBlog(blogData);
        return successResponse(c, blog, 201);
      } catch (error) {
        logger.error("Error creating blog", error as Error);
        throw error;
      }
    },

    async updateBlog(c: Context) {
      const { id } =
        (c.get("validatedParams") as BlogIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid blog ID");
          }
          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";

      // Allow both JSON and multipart updates
      if (contentType.includes("multipart/form-data")) {
        logger.info("updateBlog - handling multipart form data");
        try {
          const formData = await c.req.formData();

          const formInput = {
            title: formData.get("title"),
            slug: formData.get("slug"),
            excerpt: formData.get("excerpt"),
            content: formData.get("content"),
            authorId: formData.get("authorId"),
            publishDate: formData.get("publishDate"),
            readTimeMinutes: formData.get("readTimeMinutes"),
            tagIds: formData.get("tagIds"),
            featuredImage: formData.get("featuredImage"),
            featuredImageUrl: formData.get("featuredImageUrl"),
          };

          const validatedData = updateBlogFormSchema.parse(formInput);

          let featuredImageUrl = validatedData.featuredImageUrl;
          if (validatedData.featuredImage) {
            try {
              featuredImageUrl = await uploadBlogImage(
                validatedData.featuredImage,
              );
              logger.info(`Image uploaded successfully: ${featuredImageUrl}`);
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          const data = updateBlogSchema.parse({
            title: validatedData.title,
            slug: validatedData.slug,
            excerpt: validatedData.excerpt,
            content: validatedData.content,
            authorId: validatedData.authorId,
            publishDate: validatedData.publishDate,
            readTimeMinutes: validatedData.readTimeMinutes,
            tagIds: validatedData.tagIds,
            featuredImageUrl,
          });

          const blog = await service.updateBlog(id, data);
          return successResponse(c, blog);
        } catch (error) {
          logger.error("Error updating blog", error as Error);
          throw error;
        }
      }

      const body = await c.req.json();
      const data = updateBlogSchema.parse(body);

      const blog = await service.updateBlog(id, data);
      return successResponse(c, blog);
    },

    async deleteBlog(c: Context) {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        throw new ValidationError("Invalid blog ID");
      }

      await service.deleteBlog(id);
      return successResponse(c, { message: "Blog deleted successfully" });
    },

    async listPublishedBlogs(c: Context) {
      const query =
        (c.get("validatedQuery") as BlogQuery | undefined) ??
        blogQuerySchema.parse(c.req.query());

      const result = await service.getPublishedBlogs(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        nextCursor: result.nextCursor,
      });
    },

    async getPublishedBlog(c: Context) {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        throw new ValidationError("Invalid blog ID");
      }

      const blog = await service.getPublishedBlogById(id);
      return successResponse(c, blog);
    },

    async getPublishedBlogBySlug(c: Context) {
      const slug = c.req.param("slug");
      const blog = await service.getPublishedBlogBySlug(slug);
      return successResponse(c, blog);
    },
  };
};

export type BlogController = ReturnType<typeof createBlogController>;
