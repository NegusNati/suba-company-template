import { Hono } from "hono";

import type { BusinessSectorController } from "./controller";
import {
  businessSectorIdParamSchema,
  businessSectorQuerySchema,
  createBusinessSectorSchema,
  publicBusinessSectorQuerySchema,
  updateBusinessSectorSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createBusinessSectorRoutes = (
  controller: BusinessSectorController,
) => {
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(businessSectorQuerySchema), (c) =>
    controller.listBusinessSectors(c),
  );
  router.get("/:id", validateParams(businessSectorIdParamSchema), (c) =>
    controller.getBusinessSector(c),
  );
  router.get("/slug/:slug", (c) => controller.getBusinessSectorBySlug(c));
  router.post("/", validateBody(createBusinessSectorSchema), (c) =>
    controller.createBusinessSector(c),
  );
  router.patch(
    "/:id",
    validateParams(businessSectorIdParamSchema),
    validateBody(updateBusinessSectorSchema),
    (c) => controller.updateBusinessSector(c),
  );
  router.delete("/:id", validateParams(businessSectorIdParamSchema), (c) =>
    controller.deleteBusinessSector(c),
  );

  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicBusinessSectorQuerySchema), (c) =>
    controller.listPublicBusinessSectors(c),
  );
  clientRouter.get("/:id", validateParams(businessSectorIdParamSchema), (c) =>
    controller.getPublicBusinessSectorById(c),
  );
  clientRouter.get("/slug/:slug", (c) =>
    controller.getPublicBusinessSectorBySlug(c),
  );

  return { router, clientRouter };
};
