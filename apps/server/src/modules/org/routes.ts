import { Hono } from "hono";

import type { OrgController } from "./controller";
import {
  orgQuerySchema,
  publicOrgQuerySchema,
  orgMemberIdParamSchema,
} from "./validators";
import {
  adminNamespace,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createOrgRoutes = (controller: OrgController) => {
  // Protected admin routes - require authentication
  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(orgQuerySchema), (c) =>
    controller.listOrgMembers(c),
  );
  router.get("/:id", validateParams(orgMemberIdParamSchema), (c) =>
    controller.getOrgMember(c),
  );
  router.post("/", (c) => controller.createOrgMember(c));
  router.patch("/:id", validateParams(orgMemberIdParamSchema), (c) =>
    controller.updateOrgMember(c),
  );
  router.delete("/:id", validateParams(orgMemberIdParamSchema), (c) =>
    controller.deleteOrgMember(c),
  );

  // Public client routes - no authentication required
  const clientRouter = new Hono();

  clientRouter.get("/", validateQuery(publicOrgQuerySchema), (c) =>
    controller.getPublicOrg(c),
  );

  return { router, clientRouter };
};
