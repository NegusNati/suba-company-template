import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useState } from "react";

import { DEFAULT_DEBOUNCE_MS } from "./forms";
import { useDebounce } from "./use-debounce";

export type BaseOption = {
  label: string;
  value: string | number;
  // allow extra fields
  [key: string]: unknown;
};

type UseAsyncSelectParams<TOption extends BaseOption = BaseOption> = {
  queryKey: (search: string) => QueryKey;
  queryFn: (search: string) => Promise<TOption[]>;
  enabled?: boolean;
  debounceMs?: number;
  select?: (options: TOption[]) => TOption[];
  initialSearch?: string;
  queryOptions?: Omit<
    UseQueryOptions<TOption[], Error, TOption[], QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useAsyncSelect<TOption extends BaseOption = BaseOption>({
  queryKey,
  queryFn,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  select,
  initialSearch = "",
  queryOptions,
}: UseAsyncSelectParams<TOption>) {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch] = useDebounce(search, debounceMs);

  const {
    data = [],
    isFetching,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: queryKey(debouncedSearch),
    queryFn: () => queryFn(debouncedSearch),
    enabled,
    select,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

  return {
    options: data,
    isLoading: isPending || isFetching,
    isError,
    error,
    search,
    setSearch,
  };
}
