import { auth } from "@suba-company-template/auth";
import { Hono, type Context, type Next } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";

import { getEnv } from "./config";
import { NotFoundError } from "./http";
import {
  bodyLimitMiddleware,
  rateLimitMiddleware,
  requestIdMiddleware,
  secureHeadersMiddleware,
  requestLoggerMiddleware,
} from "./middleware";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "../shared/logger";

export const createApp = () => {
  const app = new Hono();
  const env = getEnv();

  // Global error boundary should wrap everything
  app.use(errorHandler);

  app.use(requestIdMiddleware);
  app.use(honoLogger());
  app.use(secureHeadersMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(bodyLimitMiddleware);
  app.use(rateLimitMiddleware);

  const corsOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin) => {
        if (!origin) return undefined;
        return corsOrigins.includes(origin) ? origin : undefined;
      },
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  const redirectLegacyApi = async (c: Context, next: Next) => {
    const path = c.req.path;
    if (path.startsWith("/api/v1")) {
      return next();
    }
    const suffix = path.slice("/api".length) || "";
    return c.redirect(`/api/v1${suffix}`, 308);
  };

  app.use("/api", redirectLegacyApi);
  app.use("/api/*", redirectLegacyApi);

  app.on(["POST", "GET"], "/api/v1/auth/*", async (c) => {
    const originalRequest = c.req.raw;
    const url = new URL(originalRequest.url);
    url.pathname = url.pathname.replace(/^\/api\/v1\/auth/, "/api/auth");

    try {
      const response = await auth.handler(
        new Request(url.toString(), originalRequest),
      );
      return response;
    } catch (error) {
      logger.error("[AUTH ERROR]", error as Error);
      throw error;
    }
  });

  // Serve static files (uploads)
  app.use("/uploads/*", serveStatic({ root: "./" }));

  app.get("/", (c) => {
    return c.json({ success: true, message: "Company Website Template API" });
  });

  app.notFound(() => {
    throw new NotFoundError();
  });

  return app;
};
