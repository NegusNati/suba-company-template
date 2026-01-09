import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  PublicServiceDetail,
  PublicServiceListItem,
} from "./services-schema";

import apiClient from "@/lib/axios";

export type PublicServicesListResponse = ApiSuccessResponse<
  PublicServiceListItem[]
>;
export type PublicServiceDetailResponse =
  ApiSuccessResponse<PublicServiceDetail>;

export interface PublicServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  tagId?: number;
  sortBy?: "title" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Fetches public services list with optional filtering
 */
export const fetchPublicServices = async (params?: PublicServicesParams) => {
  const { data } = await apiClient.get<PublicServicesListResponse>(
    "/api/v1/services/client",
    { params },
  );

  return data;
};

/**
 * Fetches a single public service by slug
 */
export const fetchPublicServiceBySlug = async (slug: string) => {
  const { data } = await apiClient.get<PublicServiceDetailResponse>(
    `/api/v1/services/client/${slug}`,
  );

  return data;
};
