import type { Context, Next } from "hono";

import { logger } from "../../shared/logger";
import { getEnv, type Env } from "../config";
import { PayloadTooLargeError, TooManyRequestsError } from "../http";

// Lazy load env to ensure dotenv has run first
let _env: Env | null = null;
const env = () => {
  if (!_env) _env = getEnv();
  return _env;
};

const rateBuckets = new Map<
  string,
  { count: number; resetAt: number; lastRequestAt: number }
>();

const getClientIp = (c: Context): string => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp;
  // Bun's server does not expose remoteAddress; use fallback
  return "unknown";
};

export const secureHeadersMiddleware = async (c: Context, next: Next) => {
  // Basic hardening headers
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin", {
    append: false,
  });

  // Only send HSTS when not in development to avoid localhost issues
  if (env().NODE_ENV === "production") {
    c.header(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
  }

  await next();
};

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const key = getClientIp(c);
  const now = Date.now();
  const windowMs = env().RATE_LIMIT_WINDOW_MS;
  const max = env().RATE_LIMIT_MAX_REQUESTS;

  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
      lastRequestAt: now,
    });
    return next();
  }

  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    c.header("Retry-After", `${retryAfter}`);
    throw new TooManyRequestsError(
      `Rate limit exceeded. Try again in ${retryAfter}s`,
    );
  }

  bucket.count += 1;
  bucket.lastRequestAt = now;
  rateBuckets.set(key, bucket);
  await next();
};

export const bodyLimitMiddleware = async (c: Context, next: Next) => {
  const limit = env().BODY_LIMIT_BYTES;
  const contentLength = c.req.header("content-length");
  if (contentLength) {
    const size = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(size) && size > limit) {
      throw new PayloadTooLargeError(
        `Request body exceeds limit of ${Math.floor(limit / (1024 * 1024))}MB`,
      );
    }
  }

  // Measure duration for audit logs
  const started = performance.now();
  await next();
  const duration = performance.now() - started;
  const requestId = c.get("requestId");
  logger.info("request.completed", {
    requestId,
    path: c.req.path,
    method: c.req.method,
    status: c.res.status,
    durationMs: Number(duration.toFixed(2)),
  });
};
