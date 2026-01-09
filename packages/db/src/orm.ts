// Re-export commonly used drizzle-orm utilities
// This ensures the entire workspace uses a single drizzle-orm installation

export {
  sql,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  exists,
  notExists,
  between,
  notBetween,
  like,
  ilike,
  notLike,
  notIlike,
  and,
  or,
  not,
  desc,
  asc,
  type SQL,
  type InferSelectModel,
  type InferInsertModel,
  type AnyColumn,
} from "drizzle-orm";

export type { PgTable, PgColumn } from "drizzle-orm/pg-core";
