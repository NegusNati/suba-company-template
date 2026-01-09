import { Hono } from "hono";

import type { TestimonialController } from "./controller";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  testimonialQuerySchema,
  publicTestimonialQuerySchema,
  testimonialIdParamSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createTestimonialRoutes = (controller: TestimonialController) => {
  // Protected admin routes - require authentication
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(testimonialQuerySchema), (c) =>
    controller.listTestimonials(c),
  );
  router.get("/:id", validateParams(testimonialIdParamSchema), (c) =>
    controller.getTestimonial(c),
  );
  router.post("/", validateBody(createTestimonialSchema), (c) =>
    controller.createTestimonial(c),
  );
  router.patch(
    "/:id",
    validateParams(testimonialIdParamSchema),
    validateBody(updateTestimonialSchema),
    (c) => controller.updateTestimonial(c),
  );
  router.delete("/:id", validateParams(testimonialIdParamSchema), (c) =>
    controller.deleteTestimonial(c),
  );

  // Public client routes - no authentication required
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicTestimonialQuerySchema), (c) =>
    controller.listPublicTestimonials(c),
  );

  return { router, clientRouter };
};
