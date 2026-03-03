import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  fetchPublicBlogById,
  fetchPublicBlogBySlug,
  fetchPublicBlogs,
} from "./blog-api";
import type { BlogDetail, BlogListItem } from "./blog-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

// ============================================================================
// Query Keys
// ============================================================================

export const blogKeys = {
  all: [LANDING_API_ENDPOINTS.BLOG_CLIENT] as const,
  lists: () => [...blogKeys.all] as const,
  list: (params: { page: number; limit: number; search?: string }) =>
    [...blogKeys.all, params] as const,
  details: () => [...blogKeys.all] as const,
  detail: (id: number | string) =>
    [`${LANDING_API_ENDPOINTS.BLOG_CLIENT}/${id}`] as const,
  detailBySlug: (slug: string) =>
    [`${LANDING_API_ENDPOINTS.BLOG_CLIENT}/slug/${slug}`] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const blogListQueryOptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const normalized = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 12,
    search: params?.search?.trim() || undefined,
  };

  return queryOptions({
    queryKey: blogKeys.list(normalized),
    queryFn: () => fetchPublicBlogs(normalized),
  });
};

export const blogDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: blogKeys.detailBySlug(slug),
    queryFn: () => fetchPublicBlogBySlug(slug),
    enabled: Boolean(slug),
  });

export const blogDetailByIdQueryOptions = (id: number | string) =>
  queryOptions({
    queryKey: blogKeys.detail(id),
    queryFn: () => fetchPublicBlogById(id),
    enabled: Boolean(id),
  });

// ============================================================================
// Query Hooks
// ============================================================================

interface BlogListResponse {
  data: BlogListItem[];
}

interface BlogDetailResponse {
  data: BlogDetail;
}

export const useBlogListQuery = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): UseQueryResult<BlogListResponse, Error> => {
  return useQuery(blogListQueryOptions(params));
};

export const useBlogDetailQuery = (
  slug: string,
): UseQueryResult<BlogDetailResponse, Error> => {
  return useQuery(blogDetailQueryOptions(slug));
};

export const useBlogDetailByIdQuery = (
  id: number | string,
): UseQueryResult<BlogDetailResponse, Error> => {
  return useQuery(blogDetailByIdQueryOptions(id));
};

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { fetchPublicBlogBySlug } from "./blog-api";
