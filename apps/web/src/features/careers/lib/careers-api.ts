import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  PublicVacancyDetail,
  PublicVacancyListItem,
  PublicVacancyListParams,
  VacancyApplicationFormValues,
  VacancyApplicationSubmitResponse,
} from "./careers-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type PublicVacanciesListResponse = ApiSuccessResponse<
  PublicVacancyListItem[]
>;
export type PublicVacancyDetailResponse =
  ApiSuccessResponse<PublicVacancyDetail>;
export type SubmitVacancyApplicationResponse = ApiSuccessResponse<
  Partial<VacancyApplicationSubmitResponse> & { message?: string }
>;

export const fetchPublicVacancies = async (
  params?: Partial<PublicVacancyListParams>,
) => {
  const { data } = await apiClient.get<PublicVacanciesListResponse>(
    LANDING_API_ENDPOINTS.VACANCIES_CLIENT,
    { params },
  );

  return data;
};

export const fetchPublicVacancyBySlug = async (slug: string) => {
  const { data } = await apiClient.get<PublicVacancyDetailResponse>(
    `${LANDING_API_ENDPOINTS.VACANCIES_CLIENT}/slug/${slug}`,
  );

  return data;
};

export const submitVacancyApplication = async (
  vacancyId: number | string,
  values: VacancyApplicationFormValues,
) => {
  const formData = new FormData();

  formData.append("fullName", values.fullName);
  formData.append("email", values.email);

  if (values.phone) formData.append("phone", values.phone);
  if (values.portfolioUrl) formData.append("portfolioUrl", values.portfolioUrl);
  if (values.linkedinUrl) formData.append("linkedinUrl", values.linkedinUrl);
  if (values.coverLetter) formData.append("coverLetter", values.coverLetter);
  if (values.resume) formData.append("resume", values.resume);

  // Honeypot field (kept empty by real users)
  formData.append("honeypot", values.honeypot ?? "");

  const { data } = await apiClient.post<SubmitVacancyApplicationResponse>(
    `${LANDING_API_ENDPOINTS.VACANCIES_CLIENT}/${vacancyId}/applications`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data;
};
