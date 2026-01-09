import { Hono } from "hono";

import type { OgImageController } from "./controller";

export const createOgImageRoutes = (controller: OgImageController) => {
  const router = new Hono();

  // Blog OG image
  router.get("/blog/:slug", (c) => controller.getBlogOgImage(c));

  // Service OG image
  router.get("/service/:slug", (c) => controller.getServiceOgImage(c));

  // Project/Case Study OG image
  router.get("/project/:slug", (c) => controller.getProjectOgImage(c));

  // Career/Vacancy OG image
  router.get("/career/:slug", (c) => controller.getCareerOgImage(c));

  // Generic page OG image (with query params)
  router.get("/page", (c) => controller.getPageOgImage(c));

  // Default OG image
  router.get("/default", (c) => controller.getDefaultOgImage(c));

  return router;
};
