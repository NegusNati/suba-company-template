import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import { fetchPublicTags, type PublicTagsParams } from "./tags-api";
import type { PublicTag } from "./tags-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

// ============================================================================
// Query Keys
// ============================================================================

export const tagKeys = {
  all: [LANDING_API_ENDPOINTS.TAGS_CLIENT] as const,
  lists: () => [...tagKeys.all] as const,
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    [...tagKeys.all, params ?? {}] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const publicTagsQueryOptions = (params?: PublicTagsParams) => {
  const normalized = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 50,
    search: params?.search?.trim() || undefined,
  };

  return queryOptions({
    queryKey: tagKeys.list(normalized),
    queryFn: () => fetchPublicTags(normalized),
    staleTime: 1000 * 60 * 5, // Tags are relatively static, cache for 5 minutes
  });
};

// ============================================================================
// Query Hooks
// ============================================================================

interface TagsListResponse {
  data: PublicTag[];
}

export const usePublicTagsQuery = (
  params?: PublicTagsParams,
): UseQueryResult<TagsListResponse, Error> => {
  return useQuery(publicTagsQueryOptions(params));
};
