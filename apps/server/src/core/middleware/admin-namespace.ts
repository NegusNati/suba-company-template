import type { Context, Next } from "hono";

/**
 * Simple marker middleware to tag admin routes for logging/metrics.
 */
export const adminNamespace = async (c: Context, next: Next) => {
  c.set("isAdminRoute", true);
  await next();
};
