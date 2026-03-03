import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  fetchPublicCaseStudies,
  fetchPublicCaseStudyBySlug,
  type PublicCaseStudiesParams,
} from "./case-study-api";
import type {
  PublicCaseStudyDetail,
  PublicCaseStudyListItem,
} from "./case-study-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

// ============================================================================
// Query Keys
// ============================================================================

export const caseStudyKeys = {
  all: [LANDING_API_ENDPOINTS.CASE_STUDIES_CLIENT] as const,
  lists: () => [...caseStudyKeys.all] as const,
  list: (params: {
    page: number;
    limit: number;
    search?: string;
    tagId?: number;
    clientId?: number;
    serviceId?: number;
  }) => [...caseStudyKeys.all, params] as const,
  details: () => [...caseStudyKeys.all] as const,
  detail: (id: number | string) =>
    [`${LANDING_API_ENDPOINTS.CASE_STUDIES_CLIENT}/${id}`] as const,
  detailBySlug: (slug: string) =>
    [`${LANDING_API_ENDPOINTS.CASE_STUDIES_CLIENT}/${slug}`] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const publicCaseStudiesQueryOptions = (
  params?: PublicCaseStudiesParams,
) => {
  const normalized = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 12,
    search: params?.search?.trim() || undefined,
    tagId: params?.tagId,
    clientId: params?.clientId,
    serviceId: params?.serviceId,
  };

  return queryOptions({
    queryKey: caseStudyKeys.list(normalized),
    queryFn: () => fetchPublicCaseStudies(normalized),
  });
};

export const publicCaseStudyDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: caseStudyKeys.detailBySlug(slug),
    queryFn: () => fetchPublicCaseStudyBySlug(slug),
    enabled: Boolean(slug),
  });

// ============================================================================
// Query Hooks
// ============================================================================

interface CaseStudiesListResponse {
  data: PublicCaseStudyListItem[];
}

interface CaseStudyDetailResponse {
  data: PublicCaseStudyDetail;
}

export const usePublicCaseStudiesQuery = (
  params?: PublicCaseStudiesParams,
): UseQueryResult<CaseStudiesListResponse, Error> => {
  return useQuery(publicCaseStudiesQueryOptions(params));
};

export const usePublicCaseStudyDetailQuery = (
  slug: string,
): UseQueryResult<CaseStudyDetailResponse, Error> => {
  return useQuery(publicCaseStudyDetailQueryOptions(slug));
};

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { fetchPublicCaseStudyBySlug } from "./case-study-api";
