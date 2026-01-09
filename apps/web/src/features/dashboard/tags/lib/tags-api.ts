import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type { CreateTag, Tag, TagListParams } from "./tags-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type TagResponse = ApiSuccessResponse<Tag>;
export type TagListResponse = ApiSuccessResponse<Tag[]>;

export const fetchTags = async (params: TagListParams) => {
  const { data } = await apiClient.get<TagListResponse>(
    AUTH_API_ENDPOINTS.TAG,
    { params },
  );
  return data;
};

export const createTag = async (payload: CreateTag) => {
  const { data } = await apiClient.post<TagResponse>(
    AUTH_API_ENDPOINTS.TAG,
    payload,
  );
  return data;
};

export const updateTag = async (id: number | string, payload: CreateTag) => {
  const { data } = await apiClient.patch<TagResponse>(
    `${AUTH_API_ENDPOINTS.TAG}/${id}`,
    payload,
  );
  return data;
};

export const deleteTag = async (id: number | string) => {
  const { data } = await apiClient.delete<
    ApiSuccessResponse<{ message: string }>
  >(`${AUTH_API_ENDPOINTS.TAG}/${id}`);
  return data;
};
