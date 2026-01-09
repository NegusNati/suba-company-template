import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreateTestimonialInput,
  Testimonial,
  TestimonialsListParams,
  TestimonialUpdatePayload,
} from "./testimonials-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type TestimonialResponse = ApiSuccessResponse<Testimonial>;
export type TestimonialsListResponse = ApiSuccessResponse<Testimonial[]>;
export type DeleteTestimonialResponse = ApiSuccessResponse<{ message: string }>;

type TestimonialFormMultipartPayload = {
  comment?: string;
  companyName?: string;
  spokePersonName?: string;
  spokePersonTitle?: string;
  partnerId?: number;
  companyLogo?: File;
  spokePersonHeadshot?: File;
};

const buildTestimonialFormData = (values: TestimonialFormMultipartPayload) => {
  const formData = new FormData();

  if (values.comment !== undefined) {
    formData.append("comment", values.comment);
  }

  if (values.companyName !== undefined) {
    formData.append("companyName", values.companyName);
  }

  if (values.spokePersonName !== undefined) {
    formData.append("spokePersonName", values.spokePersonName);
  }

  if (values.spokePersonTitle !== undefined) {
    formData.append("spokePersonTitle", values.spokePersonTitle);
  }

  if (values.partnerId !== undefined) {
    formData.append("partnerId", String(values.partnerId));
  }

  if (values.companyLogo) {
    formData.append("companyLogo", values.companyLogo);
  }

  if (values.spokePersonHeadshot) {
    formData.append("spokePersonHeadshot", values.spokePersonHeadshot);
  }

  return formData;
};

export const fetchTestimonials = async (params: TestimonialsListParams) => {
  const { data } = await apiClient.get<TestimonialsListResponse>(
    AUTH_API_ENDPOINTS.TESTIMONIALS,
    { params },
  );
  return data;
};

export const fetchTestimonialById = async (id: number | string) => {
  const { data } = await apiClient.get<TestimonialResponse>(
    `${AUTH_API_ENDPOINTS.TESTIMONIALS}/${id}`,
  );
  return data;
};

export const createTestimonial = async (values: CreateTestimonialInput) => {
  const formData = buildTestimonialFormData({
    comment: values.comment,
    companyName: values.companyName,
    spokePersonName: values.spokePersonName,
    spokePersonTitle: values.spokePersonTitle,
    partnerId: values.partnerId,
    companyLogo: values.companyLogo,
    spokePersonHeadshot: values.spokePersonHeadshot,
  });

  const { data } = await apiClient.post<TestimonialResponse>(
    AUTH_API_ENDPOINTS.TESTIMONIALS,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateTestimonial = async (
  id: number | string,
  values: TestimonialUpdatePayload,
) => {
  const formData = buildTestimonialFormData({
    comment: values.comment,
    companyName: values.companyName,
    spokePersonName: values.spokePersonName,
    spokePersonTitle: values.spokePersonTitle,
    partnerId: values.partnerId,
    companyLogo: values.companyLogo,
    spokePersonHeadshot: values.spokePersonHeadshot,
  });

  const { data } = await apiClient.patch<TestimonialResponse>(
    `${AUTH_API_ENDPOINTS.TESTIMONIALS}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteTestimonial = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteTestimonialResponse>(
    `${AUTH_API_ENDPOINTS.TESTIMONIALS}/${id}`,
  );
  return data;
};
