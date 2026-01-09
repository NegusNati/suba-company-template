import type { Context, Next } from "hono";

import { logger } from "../../shared/logger";

export const requestLoggerMiddleware = async (c: Context, next: Next) => {
  const started = performance.now();
  await next();
  const duration = Number((performance.now() - started).toFixed(2));

  const requestId = c.get("requestId");
  const user = c.get("user") as { id: string } | undefined;

  logger.info("http.request", {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: duration,
    userId: user?.id,
  });
};
