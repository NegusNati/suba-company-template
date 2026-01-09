import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type { PublicTag } from "./tags-schema";

import apiClient from "@/lib/axios";

export type PublicTagsListResponse = ApiSuccessResponse<PublicTag[]>;

export interface PublicTagsParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Fetches public tags list with optional filtering
 */
export const fetchPublicTags = async (params?: PublicTagsParams) => {
  const { data } = await apiClient.get<PublicTagsListResponse>(
    "/api/v1/tags/client",
    { params },
  );

  return data;
};
