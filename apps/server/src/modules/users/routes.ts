import { Hono } from "hono";

import type { UserController } from "./controller";
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  userListQuerySchema,
  userIdParamSchema,
} from "./validators";
import {
  adminNamespace,
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createUserRoutes = (controller: UserController) => {
  const router = new Hono();

  // Apply authentication and ADMIN role check to all routes
  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  // List users
  router.get("/", validateQuery(userListQuerySchema), (c) =>
    controller.listUsers(c),
  );

  // Get available roles (before :userId param to avoid route conflict)
  router.get("/roles", (c) => controller.getRoles(c));

  // Get single user
  router.get("/:userId", validateParams(userIdParamSchema), (c) =>
    controller.getUser(c),
  );

  // Create user
  router.post("/", validateBody(createUserSchema), (c) =>
    controller.createUser(c),
  );

  // Update user
  router.patch(
    "/:userId",
    validateParams(userIdParamSchema),
    validateBody(updateUserSchema),
    (c) => controller.updateUser(c),
  );

  // Assign role (specific endpoint)
  router.patch(
    "/:userId/role",
    validateParams(userIdParamSchema),
    validateBody(assignRoleSchema),
    (c) => controller.assignRole(c),
  );

  // Delete user
  router.delete("/:userId", validateParams(userIdParamSchema), (c) =>
    controller.deleteUser(c),
  );

  return { router };
};
