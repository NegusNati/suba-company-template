import { auth } from "@suba-company-template/auth";
import type { Context, Next } from "hono";

import { UnauthorizedError } from "../../../core/http";

export const requireAuth = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
