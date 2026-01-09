import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type { CreateFaq, Faq, FaqsListParams, UpdateFaq } from "./faqs-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type FaqListResponse = ApiSuccessResponse<Faq[]>;
export type FaqResponse = ApiSuccessResponse<Faq>;

export const fetchFaqs = async (params: FaqsListParams) => {
  const { data } = await apiClient.get<FaqListResponse>(
    AUTH_API_ENDPOINTS.FAQS,
    { params },
  );
  return data;
};

export const createFaq = async (payload: CreateFaq) => {
  const { data } = await apiClient.post<FaqResponse>(
    AUTH_API_ENDPOINTS.FAQS,
    payload,
  );
  return data;
};

export const updateFaq = async (
  payload: UpdateFaq & { id: number | string },
) => {
  const { id, ...rest } = payload;
  const { data } = await apiClient.patch<FaqResponse>(
    `${AUTH_API_ENDPOINTS.FAQS}/${id}`,
    rest,
  );
  return data;
};

export const deleteFaq = async (id: number | string) => {
  const { data } = await apiClient.delete<
    ApiSuccessResponse<{ message: string }>
  >(`${AUTH_API_ENDPOINTS.FAQS}/${id}`);
  return data;
};
