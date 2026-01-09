import { type SQL, or, ilike, asc, desc } from "@suba-company-template/db/orm";
import type { PgTable, PgColumn } from "@suba-company-template/db/orm";

import { ValidationError } from "../../core/http";

type SortOrder = "asc" | "desc";

export interface QueryBuilderOptions<
  T extends PgTable,
  SortKey extends string,
> {
  table: T;
  searchFields?: PgColumn[];
  sortFields?: Record<SortKey, PgColumn>;
  defaultSortField?: SortKey;
}

type Paginatable<Q> = Q extends { limit: (limit: number) => infer R }
  ? R extends { offset: (offset: number) => infer S }
    ? S
    : Q
  : Q;

type Sortable<Q> = Q extends { orderBy: (order: SQL) => infer R } ? R : Q;

export class QueryBuilder<T extends PgTable, SortKey extends string = string> {
  constructor(private options: QueryBuilderOptions<T, SortKey>) {}

  applyPagination<
    Q extends {
      limit: (limit: number) => unknown;
      offset: (offset: number) => unknown;
    },
  >(query: Q, page: number, limit: number): Paginatable<Q> {
    const offset = (page - 1) * limit;
    const limitedQuery = query.limit(limit) as {
      offset: (offset: number) => unknown;
    };
    return limitedQuery.offset(offset) as Paginatable<Q>;
  }

  applySort<Q extends { orderBy: (order: SQL) => unknown }>(
    query: Q,
    sortBy?: SortKey,
    sortOrder: SortOrder = "desc",
  ): Sortable<Q> {
    const { sortFields, defaultSortField } = this.options;

    const fieldKey = sortBy ?? defaultSortField;
    if (!fieldKey || !sortFields || !sortFields[fieldKey]) {
      if (sortBy && sortFields && !sortFields[sortBy]) {
        throw new ValidationError(`sortBy "${String(sortBy)}" is not allowed`);
      }
      return query as Sortable<Q>;
    }

    const column = sortFields[fieldKey];
    const orderFn = sortOrder === "asc" ? asc : desc;
    return query.orderBy(orderFn(column)) as Sortable<Q>;
  }

  applySearch(searchTerm?: string): SQL | undefined {
    if (!searchTerm || !this.options.searchFields?.length) return undefined;

    const normalized = searchTerm.trim();
    if (normalized.length === 0) return undefined;

    const conditions = this.options.searchFields.map((field) =>
      ilike(field, `%${normalized}%`),
    );
    return or(...conditions);
  }
}

export const createQueryBuilder = <
  T extends PgTable,
  SortKey extends string = string,
>(
  options: QueryBuilderOptions<T, SortKey>,
) => new QueryBuilder<T, SortKey>(options);
