import { Hono } from "hono";

import type { CaseStudyController } from "./controller";
import {
  caseStudyQuerySchema,
  publicCaseStudyQuerySchema,
  createCaseStudySchema,
  updateCaseStudySchema,
  caseStudyIdParamSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createCaseStudyRoutes = (controller: CaseStudyController) => {
  // Protected admin routes - require ADMIN role
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(caseStudyQuerySchema), (c) =>
    controller.listCaseStudies(c),
  );
  router.get("/:id", validateParams(caseStudyIdParamSchema), (c) =>
    controller.getCaseStudy(c),
  );
  router.post("/", validateBody(createCaseStudySchema), (c) =>
    controller.createCaseStudy(c),
  );
  router.patch(
    "/:id",
    validateParams(caseStudyIdParamSchema),
    validateBody(updateCaseStudySchema),
    (c) => controller.updateCaseStudy(c),
  );
  router.delete("/:id", validateParams(caseStudyIdParamSchema), (c) =>
    controller.deleteCaseStudy(c),
  );

  // Public client routes - no authentication required
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicCaseStudyQuerySchema), (c) =>
    controller.listPublicCaseStudies(c),
  );
  clientRouter.get("/:slug", (c) => controller.getPublicCaseStudyBySlug(c));

  return { router, clientRouter };
};
