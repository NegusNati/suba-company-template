import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPublicBusinessSectorBySlug,
  fetchPublicBusinessSectors,
} from "./business-sectors-api";
import type { PublicBusinessSectorsParams } from "./business-sectors-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const businessSectorsKeys = {
  all: [LANDING_API_ENDPOINTS.BUSINESS_SECTORS_CLIENT] as const,
  list: (params: PublicBusinessSectorsParams) =>
    [LANDING_API_ENDPOINTS.BUSINESS_SECTORS_CLIENT, params] as const,
  detailBySlug: (slug: string) =>
    [`${LANDING_API_ENDPOINTS.BUSINESS_SECTORS_CLIENT}/slug/${slug}`] as const,
};

const normalizeParams = (
  params?: PublicBusinessSectorsParams,
): PublicBusinessSectorsParams => {
  const limit = params?.limit ?? 12;
  const normalizedLimit = Math.min(Math.max(limit, 1), 50);

  return {
    page: params?.page ?? 1,
    limit: normalizedLimit,
    search: params?.search?.trim() || undefined,
    sortBy: params?.sortBy ?? "publishDate",
    sortOrder: params?.sortOrder ?? "desc",
  };
};

export const publicBusinessSectorsQueryOptions = (
  params?: PublicBusinessSectorsParams,
) => {
  const normalizedParams = normalizeParams(params);

  return queryOptions({
    queryKey: businessSectorsKeys.list(normalizedParams),
    queryFn: () => fetchPublicBusinessSectors(normalizedParams),
    staleTime: 1000 * 60 * 2,
  });
};

export const publicBusinessSectorDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: businessSectorsKeys.detailBySlug(slug),
    queryFn: () => fetchPublicBusinessSectorBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });

export const usePublicBusinessSectors = (
  params?: PublicBusinessSectorsParams,
) => useQuery(publicBusinessSectorsQueryOptions(params));

export const usePublicBusinessSectorBySlug = (slug: string) =>
  useQuery(publicBusinessSectorDetailQueryOptions(slug));

export const usePrefetchPublicBusinessSectors = (
  params?: PublicBusinessSectorsParams,
) => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.prefetchQuery(publicBusinessSectorsQueryOptions(params));
  };
};
