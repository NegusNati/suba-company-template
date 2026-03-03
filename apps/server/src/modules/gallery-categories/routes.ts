import { Hono } from "hono";

import type { GalleryCategoryController } from "./controller";
import {
  createGalleryCategorySchema,
  galleryCategoryIdParamSchema,
  galleryCategoryQuerySchema,
  publicGalleryCategoryQuerySchema,
  updateGalleryCategorySchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createGalleryCategoryRoutes = (
  controller: GalleryCategoryController,
) => {
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(galleryCategoryQuerySchema), (c) =>
    controller.listGalleryCategories(c),
  );
  router.get("/:id", validateParams(galleryCategoryIdParamSchema), (c) =>
    controller.getGalleryCategory(c),
  );
  router.post("/", validateBody(createGalleryCategorySchema), (c) =>
    controller.createGalleryCategory(c),
  );
  router.patch(
    "/:id",
    validateParams(galleryCategoryIdParamSchema),
    validateBody(updateGalleryCategorySchema),
    (c) => controller.updateGalleryCategory(c),
  );
  router.delete("/:id", validateParams(galleryCategoryIdParamSchema), (c) =>
    controller.deleteGalleryCategory(c),
  );

  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicGalleryCategoryQuerySchema), (c) =>
    controller.listPublicGalleryCategories(c),
  );

  return { router, clientRouter };
};
