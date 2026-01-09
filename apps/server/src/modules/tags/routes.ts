import { Hono } from "hono";

import type { TagController } from "./controller";
import {
  createTagSchema,
  updateTagSchema,
  tagQuerySchema,
  publicTagQuerySchema,
  tagIdParamSchema,
} from "./validators";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { adminNamespace } from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createTagRoutes = (controller: TagController) => {
  // Protected admin routes - require ADMIN role
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(tagQuerySchema), (c) => controller.listTags(c));
  router.get("/:id", validateParams(tagIdParamSchema), (c) =>
    controller.getTag(c),
  );
  router.post("/", validateBody(createTagSchema), (c) =>
    controller.createTag(c),
  );
  router.patch(
    "/:id",
    validateParams(tagIdParamSchema),
    validateBody(updateTagSchema),
    (c) => controller.updateTag(c),
  );
  router.delete("/:id", validateParams(tagIdParamSchema), (c) =>
    controller.deleteTag(c),
  );

  // Public client routes - no authentication required
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicTagQuerySchema), (c) =>
    controller.listPublicTags(c),
  );

  return { router, clientRouter };
};
