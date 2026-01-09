import { sql, type SQL } from "@suba-company-template/db/orm";
import type { PgTable } from "@suba-company-template/db/orm";
import type { ListResult } from "@suba-company-template/types/api";

import type { DbClient } from "../db";
import { buildNextCursor } from "./cursor";

// Generic count helper
export const countRecords = async (
  db: DbClient,
  table: PgTable,
  whereCondition?: SQL,
): Promise<number> => {
  const query = db.select({ count: sql<number>`count(*)` }).from(table);

  const result = whereCondition
    ? await query.where(whereCondition)
    : await query;

  return result[0]?.count ?? 0;
};

// Build list result with pagination metadata
export const buildListResult = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): ListResult<T> => {
  return { items, total, page, limit };
};

export const buildCursorResult = <T extends Record<string, unknown>>(
  items: T[],
  limit: number,
  pickCursorValue: (item: T) => unknown,
) => {
  const nextCursor = buildNextCursor(items, limit, pickCursorValue);
  return { items, nextCursor, limit };
};
