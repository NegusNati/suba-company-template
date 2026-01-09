import type { Context, Next } from "hono";

import { UnauthorizedError, ForbiddenError } from "../../../core/http";

// Roles are now lowercase and managed by Better Auth admin plugin
export type UserRole = "admin" | "blogger" | "user";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Role is now directly on the user from Better Auth session
    const userRole = (user.role || "user") as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    await next();
  };
};
