import { Hono } from "hono";

import type { FaqController } from "./controller";
import {
  createFaqSchema,
  updateFaqSchema,
  faqQuerySchema,
  publicFaqQuerySchema,
  faqIdParamSchema,
} from "./validators";
import {
  validateBody,
  validateParams,
  validateQuery,
  adminNamespace,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createFaqRoutes = (controller: FaqController) => {
  // Public client routes - no authentication required
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicFaqQuerySchema), (c) =>
    controller.listPublicFaqs(c),
  );

  // Protected admin routes - require authentication
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(faqQuerySchema), (c) => controller.listFaqs(c));
  router.get("/:id", validateParams(faqIdParamSchema), (c) =>
    controller.getFaq(c),
  );
  router.post("/", validateBody(createFaqSchema), (c) =>
    controller.createFaq(c),
  );
  router.patch(
    "/:id",
    validateParams(faqIdParamSchema),
    validateBody(updateFaqSchema),
    (c) => controller.updateFaq(c),
  );
  router.delete("/:id", validateParams(faqIdParamSchema), (c) =>
    controller.deleteFaq(c),
  );

  return { router, clientRouter };
};
