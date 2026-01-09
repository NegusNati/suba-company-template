import type { Context, Next } from "hono";

import { handleError } from "../http";

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    return handleError(error, c);
  }
};
