import { sql } from "@suba-company-template/db/orm";
import type { Hono } from "hono";

import type { Container } from "./container";
import { registerModules } from "../modules";
import { successResponse } from "./http";

export const registerRoutes = (app: Hono, container: Container) => {
  registerModules(app, container);

  // Liveness (lightweight)
  app.get("/health", (c) =>
    successResponse(c, {
      status: "ok",
      env: container.db ? "db-bound" : "none",
    }),
  );
  app.get("/api/v1/health", (c) =>
    successResponse(c, {
      status: "ok",
      env: container.db ? "db-bound" : "none",
    }),
  );

  // Readiness (checks DB)
  app.get("/ready", async (c) => {
    await container.db.execute(sql`select 1`);
    return successResponse(c, { status: "ready" });
  });
  app.get("/api/v1/ready", async (c) => {
    await container.db.execute(sql`select 1`);
    return successResponse(c, { status: "ready" });
  });
};
