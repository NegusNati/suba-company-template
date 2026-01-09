import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type { Faq } from "./faq-schema";

import apiClient from "@/lib/axios";

export type PublicFaqListResponse = ApiSuccessResponse<Faq[]>;

export const fetchPublicFaqs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "question";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await apiClient.get<PublicFaqListResponse>(
    "/api/v1/faqs/client",
    { params },
  );

  return data;
};
