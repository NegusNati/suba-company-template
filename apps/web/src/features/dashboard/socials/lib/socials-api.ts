import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreateSocial,
  Social,
  SocialsListParams,
  UpdateSocial,
} from "./socials-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";
import { buildMultipartFormData } from "@/lib/forms";

export type SocialListResponse = ApiSuccessResponse<Social[]>;
export type SocialResponse = ApiSuccessResponse<Social>;

export const fetchSocials = async (params: SocialsListParams) => {
  const { data } = await apiClient.get<SocialListResponse>(
    AUTH_API_ENDPOINTS.SOCIALS,
    { params },
  );
  return data;
};

export const createSocial = async (payload: CreateSocial) => {
  const formData = buildMultipartFormData(payload);
  const { data } = await apiClient.post<SocialResponse>(
    AUTH_API_ENDPOINTS.SOCIALS,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const updateSocial = async (
  payload: UpdateSocial & { id: number | string },
) => {
  const { id, ...rest } = payload;
  const formData = buildMultipartFormData(rest);
  const { data } = await apiClient.patch<SocialResponse>(
    `${AUTH_API_ENDPOINTS.SOCIALS}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const deleteSocial = async (id: number | string) => {
  const { data } = await apiClient.delete<
    ApiSuccessResponse<{ message: string }>
  >(`${AUTH_API_ENDPOINTS.SOCIALS}/${id}`);
  return data;
};
