import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  PublicCaseStudyDetail,
  PublicCaseStudyListItem,
} from "./case-study-schema";

import apiClient from "@/lib/axios";

export type PublicCaseStudiesListResponse = ApiSuccessResponse<
  PublicCaseStudyListItem[]
>;
export type PublicCaseStudyDetailResponse =
  ApiSuccessResponse<PublicCaseStudyDetail>;

export interface PublicCaseStudiesParams {
  page?: number;
  limit?: number;
  search?: string;
  tagId?: number;
  clientId?: number;
  serviceId?: number;
}

/**
 * Fetches public case studies list with optional filtering
 */
export const fetchPublicCaseStudies = async (
  params?: PublicCaseStudiesParams,
) => {
  const { data } = await apiClient.get<PublicCaseStudiesListResponse>(
    "/api/v1/case-studies/client",
    { params },
  );

  return data;
};

/**
 * Fetches a single public case study by slug
 */
export const fetchPublicCaseStudyBySlug = async (slug: string) => {
  const { data } = await apiClient.get<PublicCaseStudyDetailResponse>(
    `/api/v1/case-studies/client/${slug}`,
  );

  return data;
};
