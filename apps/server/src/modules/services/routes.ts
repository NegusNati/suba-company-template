import { Hono } from "hono";

import type { ServiceController } from "./controller";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  publicServiceQuerySchema,
} from "./validators";
import {
  validateBody,
  validateQuery,
  adminNamespace,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createServiceRoutes = (controller: ServiceController) => {
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(serviceQuerySchema), (c) =>
    controller.listServices(c),
  );
  router.get("/:id", (c) => controller.getService(c));
  router.post("/", validateBody(createServiceSchema), (c) =>
    controller.createService(c),
  );
  router.patch("/:id", validateBody(updateServiceSchema), (c) =>
    controller.updateService(c),
  );
  router.delete("/:id", (c) => controller.deleteService(c));

  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicServiceQuerySchema), (c) =>
    controller.listPublicServices(c),
  );
  clientRouter.get("/:slug", (c) => controller.getPublicServiceBySlug(c));

  return { router, clientRouter };
};
