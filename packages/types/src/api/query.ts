// Common query parameters for list endpoints
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface BaseListQuery
  extends PaginationParams,
    SortParams,
    SearchParams {
  // Common filters across resources
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Generic filter operator types
export type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "in"
  | "isNull"
  | "isNotNull";

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

// Generic list result with pagination metadata
export interface ListResult<T> {
  items: T[];
  total?: number;
  page: number;
  limit: number;
  nextCursor?: string;
}
