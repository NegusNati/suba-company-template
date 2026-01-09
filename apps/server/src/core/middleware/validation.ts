import type { Context, Next } from "hono";
import type { ZodSchema, ZodTypeAny } from "zod";

import { ValidationError, formatZodIssues } from "../http";

const parseSafe = <T extends ZodTypeAny>(schema: T, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      "Validation failed",
      formatZodIssues(result.error.issues),
    );
  }
  return result.data;
};

const shouldSkipJsonParsing = (contentType: string | null | undefined) => {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.toLowerCase();
  return (
    normalized.includes("multipart/form-data") ||
    normalized.includes("application/x-www-form-urlencoded")
  );
};

export const validateQuery =
  <T extends ZodTypeAny>(schema: T) =>
  async (c: Context, next: Next) => {
    const parsed = parseSafe(schema, c.req.query());
    c.set("validatedQuery", parsed);
    await next();
  };

export const validateBody =
  <T extends ZodTypeAny>(schema: T) =>
  async (c: Context, next: Next) => {
    const contentType = c.req.header("content-type");
    if (shouldSkipJsonParsing(contentType)) {
      await next();
      return;
    }

    const body = await c.req.json();
    const parsed = parseSafe(schema, body);
    c.set("validatedBody", parsed);
    await next();
  };

export const validateParams =
  <T extends ZodSchema>(schema: T) =>
  async (c: Context, next: Next) => {
    const parsed = parseSafe(schema, c.req.param());
    c.set("validatedParams", parsed);
    await next();
  };
