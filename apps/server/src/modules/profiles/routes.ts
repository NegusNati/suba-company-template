import { Hono } from "hono";

import type { ProfileController } from "./controller";
import { requireAuth } from "../../shared/auth/guards";

export const createProfileRoutes = (controller: ProfileController) => {
  const router = new Hono();

  router.use("/*", requireAuth);

  router.get("/me", (c) => controller.getMyProfile(c));
  router.patch("/me", (c) => controller.updateMyProfile(c));

  return router;
};
