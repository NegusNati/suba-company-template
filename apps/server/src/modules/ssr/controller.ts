import type { Context } from "hono";

import {
  generateHtmlShell,
  createDefaultMeta,
  createBlogMeta,
  createServiceMeta,
  createProjectMeta,
  createCareerMeta,
  createStaticPageMeta,
} from "./service";
import { logger } from "../../shared/logger";

export interface SsrControllerDeps {
  blogRepository: {
    findPublishedBySlug: (slug: string) => Promise<{
      title: string;
      excerpt: string | null;
      author: string | null;
      publishDate: string | null;
      tags?: { name: string }[];
    } | null>;
  };
  serviceRepository: {
    findPublicBySlug: (slug: string) => Promise<{
      title: string;
      excerpt: string | null;
    } | null>;
  };
  caseStudyRepository: {
    findBySlug: (slug: string) => Promise<{
      title: string;
      excerpt: string | null;
      tags?: { name: string }[];
    } | null>;
  };
  vacancyRepository: {
    findPublicBySlug: (slug: string) => Promise<{
      title: string;
      excerpt: string | null;
      department: string | null;
      location: string | null;
    } | null>;
  };
}

export type SsrController = ReturnType<typeof createSsrController>;

export const createSsrController = (deps: SsrControllerDeps) => {
  /**
   * Serve pre-rendered HTML for a path
   */
  async function servePrerenderedHtml(c: Context): Promise<Response> {
    const path = c.req.path.replace(/^\/_ssr/, "") || "/";

    try {
      const meta = await getMetaForPath(path, deps);
      const html = generateHtmlShell(meta);

      return c.html(html, 200, {
        "Cache-Control":
          "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
      });
    } catch (error) {
      logger.error("SSR error", error as Error, { path });
      // Fall back to default meta on error
      const meta = createDefaultMeta(path);
      const html = generateHtmlShell(meta);
      return c.html(html, 200);
    }
  }

  return {
    servePrerenderedHtml,
  };
};

/**
 * Get meta tags for a specific path
 */
async function getMetaForPath(
  path: string,
  deps: SsrControllerDeps,
): Promise<ReturnType<typeof createDefaultMeta>> {
  // Blog detail page: /blogs/:slug
  const blogMatch = path.match(/^\/blogs\/([^/]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1]!;
    const blog = await deps.blogRepository.findPublishedBySlug(slug);
    if (blog) {
      return createBlogMeta(slug, blog);
    }
  }

  // Service detail page: /services/:slug
  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1]!;
    const service = await deps.serviceRepository.findPublicBySlug(slug);
    if (service) {
      return createServiceMeta(slug, service);
    }
  }

  // Project detail page: /projects/:slug
  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slug = projectMatch[1]!;
    const project = await deps.caseStudyRepository.findBySlug(slug);
    if (project) {
      return createProjectMeta(slug, project);
    }
  }

  // Career detail page: /careers/:slug
  const careerMatch = path.match(/^\/careers\/([^/]+)$/);
  if (careerMatch) {
    const slug = careerMatch[1]!;
    const career = await deps.vacancyRepository.findPublicBySlug(slug);
    if (career) {
      return createCareerMeta(slug, career);
    }
  }

  // Static pages
  switch (path) {
    case "/":
      return createStaticPageMeta(
        "/",
        "Software Engineering & Digital Innovation",
        "We craft intelligent software platforms, resilient digital products, and innovation ecosystems for forward-looking teams.",
      );
    case "/about":
      return createStaticPageMeta(
        "/about",
        "About Us",
        "Learn about our company - our mission, vision, and the team behind innovative software solutions.",
      );
    case "/contact":
      return createStaticPageMeta(
        "/contact",
        "Contact Us",
        "Get in touch with us. We'd love to hear about your project and discuss how we can help.",
      );
    case "/schedule":
      return createStaticPageMeta(
        "/schedule",
        "Schedule a Meeting",
        "Book a consultation with us to discuss your software development needs.",
      );
    case "/blogs":
      return createStaticPageMeta(
        "/blogs",
        "Blog",
        "Insights, tutorials, and updates from our team on software development and digital innovation.",
      );
    case "/services":
      return createStaticPageMeta(
        "/services",
        "Our Services",
        "Explore our software engineering, digital product development, and cloud platform services.",
      );
    case "/projects":
      return createStaticPageMeta(
        "/projects",
        "Our Projects",
        "Discover our innovative projects and case studies.",
      );
    case "/careers":
      return createStaticPageMeta(
        "/careers",
        "Careers",
        "Join our team. Explore open positions and grow your career with us.",
      );
    default:
      return createDefaultMeta(path);
  }
}
