import { Hono } from "hono";

import type { VacancyController } from "./controller";
import {
  vacancyQuerySchema,
  vacancyIdParamSchema,
  updateVacancySchema,
  publicVacancyQuerySchema,
  vacancyApplicationIdParamSchema,
  vacancyApplicationQuerySchema,
  updateVacancyApplicationSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createVacancyRoutes = (controller: VacancyController) => {
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(vacancyQuerySchema), (c) =>
    controller.listVacancies(c),
  );
  router.get("/:id", validateParams(vacancyIdParamSchema), (c) =>
    controller.getVacancy(c),
  );
  router.get("/slug/:slug", (c) => controller.getVacancyBySlug(c));
  router.post("/", (c) => controller.createVacancy(c));
  router.patch(
    "/:id",
    validateParams(vacancyIdParamSchema),
    validateBody(updateVacancySchema),
    (c) => controller.updateVacancy(c),
  );
  router.delete("/:id", validateParams(vacancyIdParamSchema), (c) =>
    controller.deleteVacancy(c),
  );

  router.get(
    "/:id/applications",
    validateParams(vacancyIdParamSchema),
    validateQuery(vacancyApplicationQuerySchema),
    (c) => controller.listApplications(c),
  );
  router.get(
    "/:id/applications/:applicationId",
    validateParams(vacancyApplicationIdParamSchema),
    (c) => controller.getApplication(c),
  );
  router.patch(
    "/:id/applications/:applicationId",
    validateParams(vacancyApplicationIdParamSchema),
    validateBody(updateVacancyApplicationSchema),
    (c) => controller.updateApplication(c),
  );
  router.delete(
    "/:id/applications/:applicationId",
    validateParams(vacancyApplicationIdParamSchema),
    (c) => controller.deleteApplication(c),
  );

  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicVacancyQuerySchema), (c) =>
    controller.listPublicVacancies(c),
  );
  clientRouter.get("/slug/:slug", (c) => controller.getPublicVacancyBySlug(c));
  clientRouter.get("/:id", validateParams(vacancyIdParamSchema), (c) =>
    controller.getPublicVacancyById(c),
  );
  clientRouter.post(
    "/:id/applications",
    validateParams(vacancyIdParamSchema),
    (c) => controller.submitApplication(c),
  );

  return { router, clientRouter };
};
