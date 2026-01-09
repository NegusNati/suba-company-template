import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { normalizeQueryKey } from "./forms";

/**
 * Prefetch helper to reduce repetition in route loaders.
 * Ensures data exists in the cache and returns it.
 */
export async function prefetchResource<T>(
  queryClient: QueryClient,
  queryKey: QueryKey | (() => QueryKey),
  queryFn: () => Promise<T>,
) {
  const key = normalizeQueryKey(queryKey);
  return queryClient.ensureQueryData({
    queryKey: key,
    queryFn,
  });
}
