import { Hono } from "hono";

import type { PartnerController } from "./controller";
import {
  createPartnerSchema,
  updatePartnerSchema,
  partnersQuerySchema,
  publicPartnersQuerySchema,
  partnerIdParamSchema,
} from "./validators";
import {
  validateBody,
  validateParams,
  validateQuery,
  adminNamespace,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createPartnerRoutes = (controller: PartnerController) => {
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicPartnersQuerySchema), (c) =>
    controller.listPublicPartners(c),
  );
  clientRouter.get("/:slug", (c) => controller.getPartnerBySlug(c));

  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(partnersQuerySchema), (c) =>
    controller.listPartners(c),
  );
  router.get("/:id", validateParams(partnerIdParamSchema), (c) =>
    controller.getPartner(c),
  );
  router.post("/", validateBody(createPartnerSchema), (c) =>
    controller.createPartner(c),
  );
  router.patch(
    "/:id",
    validateParams(partnerIdParamSchema),
    validateBody(updatePartnerSchema),
    (c) => controller.updatePartner(c),
  );
  router.delete("/:id", validateParams(partnerIdParamSchema), (c) =>
    controller.deletePartner(c),
  );

  return { router, clientRouter };
};
