import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { DEFAULT_DEBOUNCE_MS } from "./forms";
import { useDebounce } from "./use-debounce";

export type SortOrder = "asc" | "desc";

export type TableFilterState = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
};

type UseTableFiltersOptions = {
  route: string; // route path used by tanstack router (e.g., "/dashboard/products/")
  defaults?: Partial<TableFilterState>;
  debounceMs?: number;
};

export function useTableFilters({
  route,
  defaults = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseTableFiltersOptions) {
  const navigate = useNavigate();
  const rawSearch = useSearch({
    from: route as never,
  }) as Partial<TableFilterState> | undefined;
  const search = rawSearch ?? {};

  const normalizeNumber = (value: unknown, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const page = normalizeNumber(search.page, defaults.page ?? 1);
  const limit = normalizeNumber(search.limit, defaults.limit ?? 10);
  const sortBy = (search.sortBy ?? defaults.sortBy ?? "createdAt") as string;
  const sortOrder =
    search.sortOrder === "asc" || search.sortOrder === "desc"
      ? search.sortOrder
      : ((defaults.sortOrder as SortOrder) ?? "desc");
  const searchValue: string =
    typeof search.search === "string"
      ? search.search
      : typeof defaults.search === "string"
        ? defaults.search
        : "";

  const [debouncedSearch] = useDebounce(searchValue ?? "", debounceMs);

  const setPage = useCallback(
    (nextPage: number) => {
      navigate({
        to: route,
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          page: nextPage,
        }),
      });
    },
    [navigate, route],
  );

  const setLimit = useCallback(
    (nextLimit: number) => {
      navigate({
        to: route,
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          limit: nextLimit,
          page: 1, // reset page when page size changes
        }),
      });
    },
    [navigate, route],
  );

  const setSearch = useCallback(
    (value: string) => {
      navigate({
        to: route,
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          search: value || undefined,
          page: 1,
        }),
      });
    },
    [navigate, route],
  );

  const setSort = useCallback(
    (nextSortBy: string, nextSortOrder: SortOrder = "desc") => {
      navigate({
        to: route,
        search: (prev) =>
          ({
            ...prev,
            sortBy: nextSortBy,
            sortOrder: nextSortOrder,
            page: 1,
          }) as typeof prev,
      });
    },
    [navigate, route],
  );

  return useMemo(
    () => ({
      page,
      limit,
      search: searchValue,
      debouncedSearch,
      sortBy,
      sortOrder,
      setPage,
      setLimit,
      setSearch,
      setSort,
    }),
    [
      debouncedSearch,
      limit,
      page,
      searchValue,
      setLimit,
      setPage,
      setSearch,
      setSort,
      sortBy,
      sortOrder,
    ],
  );
}
