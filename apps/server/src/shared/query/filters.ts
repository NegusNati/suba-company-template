import {
  and,
  eq,
  gte,
  lte,
  inArray,
  type SQL,
} from "@suba-company-template/db/orm";
import type { AnyColumn } from "@suba-company-template/db/orm";

/**
 * Build an equality condition only when value is defined
 */
export const optionalEq = <T>(
  column: AnyColumn,
  value: T | undefined | null,
): SQL | undefined => {
  if (value === undefined || value === null) return undefined;
  return eq(column, value as never);
};

/**
 * Build an IN condition when values array is non-empty
 */
export const optionalInArray = <T>(
  column: AnyColumn,
  values: T[] | undefined | null,
): SQL | undefined => {
  if (!values || values.length === 0) return undefined;
  return inArray(column, values as never[]);
};

/**
 * Build date range condition; supports open-ended ranges.
 */
export const optionalDateRange = (
  column: AnyColumn,
  from?: string,
  to?: string,
): SQL | undefined => {
  const clauses: SQL[] = [];
  if (from) clauses.push(gte(column, from as never));
  if (to) clauses.push(lte(column, to as never));
  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return and(...clauses);
};

/**
 * Combine conditions while filtering out undefined
 */
export const combineWhere = (
  ...conditions: Array<SQL | undefined>
): SQL | undefined => {
  const filtered = conditions.filter(Boolean) as SQL[];
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return and(...filtered);
};
