import { createOgImageController } from "./controller";
import { createOgImageRoutes } from "./routes";
import { db } from "../../shared/db";
import { createBlogRepository } from "../blogs/repository";
import { createCaseStudyRepository } from "../case-studies/repository";
import { createServiceRepository } from "../services/repository";
import type { ModuleDeps } from "../types";
import { createVacancyRepository } from "../vacancies/repository";

export const initOgImageModule = (deps: ModuleDeps = { db }) => {
  // Create repositories
  const blogRepository = createBlogRepository(deps.db);
  const serviceRepository = createServiceRepository(deps.db);
  const caseStudyRepository = createCaseStudyRepository(deps.db);
  const vacancyRepository = createVacancyRepository(deps.db);

  // Adapt repositories to controller interface
  const controller = createOgImageController({
    db: deps.db,
    blogRepository: {
      findPublishedBySlug: async (slug: string) => {
        const blog = await blogRepository.findPublishedBySlug(slug);
        if (!blog) return null;
        return {
          title: blog.title,
          excerpt: blog.excerpt,
          featuredImageUrl: blog.featuredImageUrl,
          author: blog.author,
          publishDate: blog.publishDate
            ? new Date(blog.publishDate).toISOString()
            : null,
          readTimeMinutes: blog.readTimeMinutes,
          tags: blog.tags,
        };
      },
    },
    serviceRepository: {
      findPublishedBySlug: async (slug: string) => {
        const service = await serviceRepository.findPublicBySlug(slug);
        if (!service) return null;
        return {
          title: service.title,
          excerpt: service.excerpt,
          featuredImageUrl: service.featuredImageUrl,
        };
      },
    },
    caseStudyRepository: {
      findPublishedBySlug: async (slug: string) => {
        const caseStudy = await caseStudyRepository.findBySlug(slug);
        if (!caseStudy) return null;
        return {
          title: caseStudy.title,
          excerpt: caseStudy.excerpt,
          featuredImageUrl: caseStudy.featuredImageUrl,
          tags: caseStudy.tags,
        };
      },
    },
    vacancyRepository: {
      findPublishedBySlug: async (slug: string) => {
        const vacancy = await vacancyRepository.findPublicBySlug(slug);
        if (!vacancy) return null;
        return {
          title: vacancy.title,
          excerpt: vacancy.excerpt,
          department: vacancy.department,
          location: vacancy.location,
          employmentType: vacancy.employmentType,
        };
      },
    },
  });

  const clientRouter = createOgImageRoutes(controller);

  return { clientRouter };
};
