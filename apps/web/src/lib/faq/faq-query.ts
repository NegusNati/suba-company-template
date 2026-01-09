import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import { fetchPublicFaqs } from "./faq-api";
import type { Faq } from "./faq-schema";

// ============================================================================
// Query Keys
// ============================================================================

export const faqKeys = {
  all: ["faqs"] as const,
  lists: () => [...faqKeys.all, "list"] as const,
  list: (params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: "createdAt" | "question";
    sortOrder?: "asc" | "desc";
  }) => [...faqKeys.lists(), params] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const faqListQueryOptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "question";
  sortOrder?: "asc" | "desc";
}) => {
  const normalized = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    search: params?.search?.trim() || undefined,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  };

  return queryOptions({
    queryKey: faqKeys.list(normalized),
    queryFn: () => fetchPublicFaqs(normalized),
  });
};

// ============================================================================
// Query Hooks
// ============================================================================

interface FaqListResponse {
  data: Faq[];
}

export const useFaqListQuery = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "question";
  sortOrder?: "asc" | "desc";
}): UseQueryResult<FaqListResponse, Error> => {
  return useQuery(faqListQueryOptions(params));
};
