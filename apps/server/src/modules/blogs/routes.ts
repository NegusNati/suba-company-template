import { Hono } from "hono";

import type { BlogController } from "./controller";
import {
  blogQuerySchema,
  createBlogSchema,
  updateBlogSchema,
  blogIdParamSchema,
} from "./validators";
import {
  validateBody,
  validateParams,
  validateQuery,
  adminNamespace,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createBlogRoutes = (controller: BlogController) => {
  // Protected admin routes - require BLOGGER or ADMIN role
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("blogger", "admin"));

  router.get("/", validateQuery(blogQuerySchema), (c) =>
    controller.listBlogs(c),
  );
  router.get("/:id", validateParams(blogIdParamSchema), (c) =>
    controller.getBlog(c),
  );
  router.get("/slug/:slug", (c) => controller.getBlogBySlug(c));
  router.post("/", validateBody(createBlogSchema), (c) =>
    controller.createBlog(c),
  );
  router.patch(
    "/:id",
    validateParams(blogIdParamSchema),
    validateBody(updateBlogSchema),
    (c) => controller.updateBlog(c),
  );
  router.delete("/:id", validateParams(blogIdParamSchema), (c) =>
    controller.deleteBlog(c),
  );

  // Public client routes - no authentication required
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(blogQuerySchema), (c) =>
    controller.listPublishedBlogs(c),
  );
  clientRouter.get("/slug/:slug", (c) => controller.getPublishedBlogBySlug(c));
  clientRouter.get("/:id", (c) => controller.getPublishedBlog(c));

  return { router, clientRouter };
};
