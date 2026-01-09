import { Hono } from "hono";

import type { GalleryController } from "./controller";
import {
  createGalleryItemSchema,
  updateGalleryItemSchema,
  galleryQuerySchema,
  publicGalleryQuerySchema,
  galleryIdParamSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createGalleryRoutes = (controller: GalleryController) => {
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(galleryQuerySchema), (c) =>
    controller.listGalleryItems(c),
  );
  router.get("/:id", validateParams(galleryIdParamSchema), (c) =>
    controller.getGalleryItem(c),
  );
  router.post("/", validateBody(createGalleryItemSchema), (c) =>
    controller.createGalleryItem(c),
  );
  router.patch(
    "/:id",
    validateParams(galleryIdParamSchema),
    validateBody(updateGalleryItemSchema),
    (c) => controller.updateGalleryItem(c),
  );
  router.delete("/:id", validateParams(galleryIdParamSchema), (c) =>
    controller.deleteGalleryItem(c),
  );

  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicGalleryQuerySchema), (c) =>
    controller.listPublicGalleryItems(c),
  );

  return { router, clientRouter };
};
