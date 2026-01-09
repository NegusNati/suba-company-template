import { Hono } from "hono";

import type { SsrController } from "./controller";

export const createSsrRoutes = (controller: SsrController) => {
  const router = new Hono();

  // Catch-all route for SSR pre-rendering
  // nginx will route crawler requests to /_ssr/* which will be handled here
  router.get("/*", (c) => controller.servePrerenderedHtml(c));

  return router;
};
