import { createSsrController } from "./controller";
import { createSsrRoutes } from "./routes";
import { db } from "../../shared/db";
import { createBlogRepository } from "../blogs/repository";
import { createCaseStudyRepository } from "../case-studies/repository";
import { createServiceRepository } from "../services/repository";
import type { ModuleDeps } from "../types";
import { createVacancyRepository } from "../vacancies/repository";

export const initSsrModule = (deps: ModuleDeps = { db }) => {
  // Create repositories
  const blogRepository = createBlogRepository(deps.db);
  const serviceRepository = createServiceRepository(deps.db);
  const caseStudyRepository = createCaseStudyRepository(deps.db);
  const vacancyRepository = createVacancyRepository(deps.db);

  // Create controller with repository adapters
  const controller = createSsrController({
    blogRepository: {
      findPublishedBySlug: async (slug: string) => {
        const blog = await blogRepository.findPublishedBySlug(slug);
        if (!blog) return null;
        return {
          title: blog.title,
          excerpt: blog.excerpt,
          author: blog.author?.name ?? null,
          publishDate: blog.publishDate
            ? new Date(blog.publishDate).toISOString()
            : null,
          tags: blog.tags,
        };
      },
    },
    serviceRepository: {
      findPublicBySlug: async (slug: string) => {
        const service = await serviceRepository.findPublicBySlug(slug);
        if (!service) return null;
        return {
          title: service.title,
          excerpt: service.excerpt,
        };
      },
    },
    caseStudyRepository: {
      findBySlug: async (slug: string) => {
        const caseStudy = await caseStudyRepository.findBySlug(slug);
        if (!caseStudy) return null;
        return {
          title: caseStudy.title,
          excerpt: caseStudy.excerpt,
          tags: caseStudy.tags,
        };
      },
    },
    vacancyRepository: {
      findPublicBySlug: async (slug: string) => {
        const vacancy = await vacancyRepository.findPublicBySlug(slug);
        if (!vacancy) return null;
        return {
          title: vacancy.title,
          excerpt: vacancy.excerpt,
          department: vacancy.department,
          location: vacancy.location,
        };
      },
    },
  });

  const clientRouter = createSsrRoutes(controller);

  return { clientRouter };
};
