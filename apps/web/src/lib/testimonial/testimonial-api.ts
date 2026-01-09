import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type { Testimonial } from "./testimonial-schema";

import apiClient from "@/lib/axios";

export type PublicTestimonialListResponse = ApiSuccessResponse<Testimonial[]>;

export const fetchPublicTestimonials = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { data } = await apiClient.get<PublicTestimonialListResponse>(
    "/api/v1/testimonials/client",
    { params },
  );

  return data;
};
