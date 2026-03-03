import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  fetchPublicProductBySlug,
  fetchPublicProducts,
  type PublicProductsParams,
} from "./products-api";
import type {
  PublicProductDetail,
  PublicProductListItem,
} from "./products-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

// ============================================================================
// Query Keys
// ============================================================================

export const productKeys = {
  all: [LANDING_API_ENDPOINTS.PRODUCTS_CLIENT] as const,
  lists: () => [...productKeys.all] as const,
  list: (params: {
    page: number;
    limit: number;
    search?: string;
    tagId?: number;
  }) => [...productKeys.all, params] as const,
  details: () => [...productKeys.all] as const,
  detail: (id: number | string) =>
    [`${LANDING_API_ENDPOINTS.PRODUCTS_CLIENT}/${id}`] as const,
  detailBySlug: (slug: string) =>
    [`${LANDING_API_ENDPOINTS.PRODUCTS_CLIENT}/${slug}`] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const publicProductsQueryOptions = (params?: PublicProductsParams) => {
  const normalized = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 12,
    search: params?.search?.trim() || undefined,
    tagId: params?.tagId,
  };

  return queryOptions({
    queryKey: productKeys.list(normalized),
    queryFn: () => fetchPublicProducts(normalized),
  });
};

export const publicProductDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: productKeys.detailBySlug(slug),
    queryFn: () => fetchPublicProductBySlug(slug),
    enabled: Boolean(slug),
  });

// ============================================================================
// Query Hooks
// ============================================================================

interface ProductsListResponse {
  data: PublicProductListItem[];
}

interface ProductDetailResponse {
  data: PublicProductDetail;
}

export const usePublicProductsQuery = (
  params?: PublicProductsParams,
): UseQueryResult<ProductsListResponse, Error> => {
  return useQuery(publicProductsQueryOptions(params));
};

export const usePublicProductDetailQuery = (
  slug: string,
): UseQueryResult<ProductDetailResponse, Error> => {
  return useQuery(publicProductDetailQueryOptions(slug));
};

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { fetchPublicProductBySlug } from "./products-api";
