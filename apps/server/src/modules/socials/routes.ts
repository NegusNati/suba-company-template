import { Hono } from "hono";

import type { SocialController } from "./controller";
import {
  createSocialSchema,
  updateSocialSchema,
  socialQuerySchema,
  publicSocialQuerySchema,
  socialIdParamSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createSocialRoutes = (controller: SocialController) => {
  const clientRouter = new Hono();
  clientRouter.get("/", validateQuery(publicSocialQuerySchema), (c) =>
    controller.listPublicSocials(c),
  );
  clientRouter.get("/:title", (c) => controller.getPublicSocialByTitle(c));

  const router = new Hono();
  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(socialQuerySchema), (c) =>
    controller.listSocials(c),
  );
  router.get("/:id", validateParams(socialIdParamSchema), (c) =>
    controller.getSocial(c),
  );
  router.post("/", validateBody(createSocialSchema), (c) =>
    controller.createSocial(c),
  );
  router.patch(
    "/:id",
    validateParams(socialIdParamSchema),
    validateBody(updateSocialSchema),
    (c) => controller.updateSocial(c),
  );
  router.delete("/:id", validateParams(socialIdParamSchema), (c) =>
    controller.deleteSocial(c),
  );

  return { router, clientRouter };
};
