import type { Context } from "hono";

import { generateOgImage, generateDefaultOgImage } from "./service";
import type { OgImageData } from "./types";
import type { DbClient } from "../../shared/db";
import { logger } from "../../shared/logger";

// Repository types
type BlogData = {
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  author: { name: string } | null;
  publishDate: string | null;
  readTimeMinutes: number | null;
  tags: Array<{ name: string }>;
};

type ServiceData = {
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
};

type CaseStudyData = {
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  tags: Array<{ name: string }>;
};

type VacancyData = {
  title: string;
  excerpt: string | null;
  department: string | null;
  location: string | null;
  employmentType: string | null;
};

export interface OgImageControllerDeps {
  db: DbClient;
  blogRepository: {
    findPublishedBySlug: (slug: string) => Promise<BlogData | null>;
  };
  serviceRepository: {
    findPublishedBySlug: (slug: string) => Promise<ServiceData | null>;
  };
  caseStudyRepository: {
    findPublishedBySlug: (slug: string) => Promise<CaseStudyData | null>;
  };
  vacancyRepository: {
    findPublishedBySlug: (slug: string) => Promise<VacancyData | null>;
  };
}

export const createOgImageController = (deps: OgImageControllerDeps) => {
  /**
   * Helper to format date for display
   */
  const formatDate = (dateStr: string | null): string | undefined => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Return image response
   */
  const returnImageResponse = async (
    imageResponse: Response,
  ): Promise<Response> => {
    // Get the image data from the ImageResponse
    const arrayBuffer = await imageResponse.arrayBuffer();

    // Create headers - preserve cache control from the original response
    const headers = new Headers();
    headers.set("Content-Type", "image/png");
    headers.set(
      "Cache-Control",
      imageResponse.headers.get("Cache-Control") ||
        "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
    );

    return new Response(arrayBuffer, {
      status: 200,
      headers,
    });
  };

  return {
    /**
     * Generate OG image for a blog post
     */
    async getBlogOgImage(c: Context): Promise<Response> {
      const { slug } = c.req.param();

      try {
        if (!slug) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const blog = await deps.blogRepository.findPublishedBySlug(slug);

        if (!blog) {
          // Return default image if blog not found
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const data: OgImageData = {
          title: blog.title,
          description: blog.excerpt || undefined,
          imageUrl: blog.featuredImageUrl,
          type: "blog",
          category: "Blog",
          author: blog.author?.name,
          date: formatDate(blog.publishDate),
          readTime: blog.readTimeMinutes || undefined,
          tags: blog.tags?.map((t) => t.name) || [],
        };

        const imageResponse = await generateOgImage(data);
        return returnImageResponse(imageResponse);
      } catch (error) {
        logger.error("Error generating blog OG image", error as Error);
        const defaultImage = await generateDefaultOgImage();
        return returnImageResponse(defaultImage);
      }
    },

    /**
     * Generate OG image for a service page
     */
    async getServiceOgImage(c: Context): Promise<Response> {
      const { slug } = c.req.param();

      try {
        if (!slug) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const service = await deps.serviceRepository.findPublishedBySlug(slug);

        if (!service) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const data: OgImageData = {
          title: service.title,
          description: service.excerpt || undefined,
          imageUrl: service.featuredImageUrl,
          type: "service",
        };

        const imageResponse = await generateOgImage(data);
        return returnImageResponse(imageResponse);
      } catch (error) {
        logger.error("Error generating service OG image", error as Error);
        const defaultImage = await generateDefaultOgImage();
        return returnImageResponse(defaultImage);
      }
    },

    /**
     * Generate OG image for a case study/project
     */
    async getProjectOgImage(c: Context): Promise<Response> {
      const { slug } = c.req.param();

      try {
        if (!slug) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const project =
          await deps.caseStudyRepository.findPublishedBySlug(slug);

        if (!project) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const data: OgImageData = {
          title: project.title,
          description: project.excerpt || undefined,
          imageUrl: project.featuredImageUrl,
          type: "project",
          tags: project.tags?.map((t) => t.name) || [],
        };

        const imageResponse = await generateOgImage(data);
        return returnImageResponse(imageResponse);
      } catch (error) {
        logger.error("Error generating project OG image", error as Error);
        const defaultImage = await generateDefaultOgImage();
        return returnImageResponse(defaultImage);
      }
    },

    /**
     * Generate OG image for a career/vacancy
     */
    async getCareerOgImage(c: Context): Promise<Response> {
      const { slug } = c.req.param();

      try {
        if (!slug) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const vacancy = await deps.vacancyRepository.findPublishedBySlug(slug);

        if (!vacancy) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        // Build tags from job details
        const jobTags: string[] = [];
        if (vacancy.department) jobTags.push(vacancy.department);
        if (vacancy.location) jobTags.push(vacancy.location);
        if (vacancy.employmentType) jobTags.push(vacancy.employmentType);

        const data: OgImageData = {
          title: vacancy.title,
          description: vacancy.excerpt || undefined,
          type: "career",
          category: "Careers",
          tags: jobTags,
        };

        const imageResponse = await generateOgImage(data);
        return returnImageResponse(imageResponse);
      } catch (error) {
        logger.error("Error generating career OG image", error as Error);
        const defaultImage = await generateDefaultOgImage();
        return returnImageResponse(defaultImage);
      }
    },

    /**
     * Generate OG image for a generic page
     */
    async getPageOgImage(c: Context): Promise<Response> {
      const title = c.req.query("title");
      const description = c.req.query("description");
      const category = c.req.query("category");
      const imageUrl = c.req.query("image");

      try {
        if (!title) {
          const defaultImage = await generateDefaultOgImage();
          return returnImageResponse(defaultImage);
        }

        const data: OgImageData = {
          title,
          description: description || undefined,
          imageUrl: imageUrl || null,
          type: "page",
          category: category || undefined,
        };

        const imageResponse = await generateOgImage(data);
        return returnImageResponse(imageResponse);
      } catch (error) {
        logger.error("Error generating page OG image", error as Error);
        const defaultImage = await generateDefaultOgImage();
        return returnImageResponse(defaultImage);
      }
    },

    /**
     * Generate default OG image
     */
    async getDefaultOgImage(c: Context): Promise<Response> {
      try {
        const imageResponse = await generateDefaultOgImage();
        return returnImageResponse(imageResponse);
      } catch (error) {
        logger.error("Error generating default OG image", error as Error);
        // Return a basic error response
        return c.text("Error generating image", 500);
      }
    },
  };
};

export type OgImageController = ReturnType<typeof createOgImageController>;
