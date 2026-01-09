import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreatePartnerInput,
  Partner,
  PartnerListParams,
  PartnerUpdatePayload,
} from "./partners-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type PartnerResponse = ApiSuccessResponse<Partner>;
export type PartnerListResponse = ApiSuccessResponse<Partner[]>;
export type DeletePartnerResponse = ApiSuccessResponse<{ message: string }>;

type PartnerFormMultipartPayload = {
  title?: string;
  description?: string;
  websiteUrl?: string;
  slug?: string;
  logoUrl?: string;
  logo?: File;
};

const buildPartnerFormData = (values: PartnerFormMultipartPayload) => {
  const formData = new FormData();
  if (values.title) formData.append("title", values.title);
  if (values.description) formData.append("description", values.description);
  if (values.websiteUrl) formData.append("websiteUrl", values.websiteUrl);
  if (values.slug) formData.append("slug", values.slug);
  if (values.logoUrl) formData.append("logoUrl", values.logoUrl);
  if (values.logo) formData.append("logo", values.logo);
  return formData;
};

export const fetchPartners = async (params: PartnerListParams) => {
  const { data } = await apiClient.get<PartnerListResponse>(
    AUTH_API_ENDPOINTS.PARTNER,
    { params },
  );
  return data;
};

export const fetchPartnerById = async (id: number | string) => {
  const { data } = await apiClient.get<PartnerResponse>(
    `${AUTH_API_ENDPOINTS.PARTNER}/${id}`,
  );
  return data;
};

export const createPartner = async (values: CreatePartnerInput) => {
  const formData = buildPartnerFormData(values);
  const { data } = await apiClient.post<PartnerResponse>(
    AUTH_API_ENDPOINTS.PARTNER,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const updatePartner = async (
  id: number | string,
  values: PartnerUpdatePayload,
) => {
  const formData = buildPartnerFormData(values);
  const { data } = await apiClient.patch<PartnerResponse>(
    `${AUTH_API_ENDPOINTS.PARTNER}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const deletePartner = async (id: number | string) => {
  const { data } = await apiClient.delete<DeletePartnerResponse>(
    `${AUTH_API_ENDPOINTS.PARTNER}/${id}`,
  );
  return data;
};
