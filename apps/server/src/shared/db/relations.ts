import type { db } from "@suba-company-template/db";

/**
 * Safely access Drizzle's relational query API.
 * Drizzle types db.query as available when schema is provided,
 * but TypeScript may not always recognize it properly.
 */
export function getQueryAPI(dbInstance: typeof db) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dbInstance as any).query;
}
