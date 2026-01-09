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

// ============================================================================
// Query Keys
// ============================================================================

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; search?: string }) =>
    [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (id: number | string) => [...blogKeys.details(), String(id)] as const,
  detailBySlug: (slug: string) =>
    [...blogKeys.details(), "slug", slug] as const,
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
