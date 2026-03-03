import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PublicServicesParams } from "./services-api";
import { fetchPublicServices, fetchPublicServiceBySlug } from "./services-api";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

/**
 * Query key factory for services
 * Centralizes all query keys for better cache management
 */
export const servicesKeys = {
  all: [LANDING_API_ENDPOINTS.SERVICES_CLIENT] as const,
  list: (params: PublicServicesParams) =>
    [LANDING_API_ENDPOINTS.SERVICES_CLIENT, params] as const,
  detailBySlug: (slug: string) =>
    [`${LANDING_API_ENDPOINTS.SERVICES_CLIENT}/${slug}`] as const,
};

/**
 * Normalizes query parameters to prevent unnecessary refetches
 */
const normalizeParams = (
  params?: PublicServicesParams,
): PublicServicesParams => {
  const limit = params?.limit ?? 12;
  const normalizedLimit = Math.min(Math.max(limit, 1), 50);

  return {
    page: params?.page ?? 1,
    limit: normalizedLimit,
    search: params?.search ?? undefined,
    tagId: params?.tagId ?? undefined,
    sortBy: params?.sortBy ?? "createdAt",
    sortOrder: params?.sortOrder ?? "desc",
  };
};

/**
 * Query options for public services list
 */
export const publicServicesQueryOptions = (params?: PublicServicesParams) => {
  const normalizedParams = normalizeParams(params);

  return queryOptions({
    queryKey: servicesKeys.list(normalizedParams),
    queryFn: () => fetchPublicServices(normalizedParams),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Query options for a single public service
 */
export const publicServiceBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: servicesKeys.detailBySlug(slug),
    queryFn: () => fetchPublicServiceBySlug(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/**
 * Hook to get public services list
 */
export const usePublicServices = (params?: PublicServicesParams) => {
  return useQuery(publicServicesQueryOptions(params));
};

/**
 * Hook to get a single public service by slug
 */
export const usePublicServiceBySlug = (slug: string) => {
  return useQuery(publicServiceBySlugQueryOptions(slug));
};

/**
 * Hook to prefetch public services
 */
export const usePrefetchPublicServices = (params?: PublicServicesParams) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery(publicServicesQueryOptions(params));
  };
};

/**
 * Hook to prefetch a single service
 */
export const usePrefetchPublicServiceBySlug = (slug: string) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery(publicServiceBySlugQueryOptions(slug));
  };
};
