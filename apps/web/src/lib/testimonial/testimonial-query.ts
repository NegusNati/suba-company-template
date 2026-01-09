import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import { fetchPublicTestimonials } from "./testimonial-api";
import type { Testimonial } from "./testimonial-schema";

// ============================================================================
// Query Keys
// ============================================================================

export const testimonialKeys = {
  all: ["testimonials"] as const,
  lists: () => [...testimonialKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; search?: string }) =>
    [...testimonialKeys.lists(), params] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const testimonialListQueryOptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const normalized = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    search: params?.search?.trim() || undefined,
  };

  return queryOptions({
    queryKey: testimonialKeys.list(normalized),
    queryFn: () => fetchPublicTestimonials(normalized),
  });
};

// ============================================================================
// Query Hooks
// ============================================================================

interface TestimonialListResponse {
  data: Testimonial[];
}

export const useTestimonialListQuery = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): UseQueryResult<TestimonialListResponse, Error> => {
  return useQuery(testimonialListQueryOptions(params));
};
