import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  Vacancy,
  VacancyApplication,
  VacanciesListParams,
  VacancyApplicationsListParams,
  CreateVacancyInput,
  UpdateVacancyInput,
  UpdateVacancyApplicationInput,
} from "./vacancies-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type VacancyResponse = ApiSuccessResponse<Vacancy>;
export type VacancyListResponse = ApiSuccessResponse<Vacancy[]>;
export type DeleteVacancyResponse = ApiSuccessResponse<{ message: string }>;

export type VacancyApplicationsResponse = ApiSuccessResponse<
  VacancyApplication[]
>;
export type VacancyApplicationResponse = ApiSuccessResponse<VacancyApplication>;
export type DeleteVacancyApplicationResponse = ApiSuccessResponse<{
  message: string;
}>;

type VacancyFormMultipartPayload = {
  title?: string;
  excerpt?: string;
  description?: string;
  department?: string;
  location?: string;
  workplaceType?: string;
  employmentType?: string;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  externalApplyUrl?: string;
  applyEmail?: string;
  status?: string;
  publishedAt?: string;
  deadlineAt?: string;
  tagIds?: number[];
  featuredImage?: File;
};

const buildVacancyFormData = (values: VacancyFormMultipartPayload) => {
  const formData = new FormData();

  if (values.title !== undefined) formData.append("title", values.title);
  if (values.excerpt !== undefined) formData.append("excerpt", values.excerpt);
  if (values.description !== undefined)
    formData.append("description", values.description);
  if (values.department !== undefined)
    formData.append("department", values.department);
  if (values.location !== undefined)
    formData.append("location", values.location);
  if (values.workplaceType !== undefined)
    formData.append("workplaceType", values.workplaceType);
  if (values.employmentType !== undefined)
    formData.append("employmentType", values.employmentType);
  if (values.seniority !== undefined)
    formData.append("seniority", values.seniority);
  if (values.salaryMin !== undefined)
    formData.append("salaryMin", String(values.salaryMin));
  if (values.salaryMax !== undefined)
    formData.append("salaryMax", String(values.salaryMax));
  if (values.salaryCurrency !== undefined)
    formData.append("salaryCurrency", values.salaryCurrency);
  if (values.externalApplyUrl !== undefined)
    formData.append("externalApplyUrl", values.externalApplyUrl);
  if (values.applyEmail !== undefined)
    formData.append("applyEmail", values.applyEmail);
  if (values.status !== undefined) formData.append("status", values.status);
  if (values.publishedAt !== undefined)
    formData.append("publishedAt", values.publishedAt);
  if (values.deadlineAt !== undefined)
    formData.append("deadlineAt", values.deadlineAt);

  if (values.tagIds !== undefined) {
    formData.append("tagIds", JSON.stringify(values.tagIds));
  }

  if (values.featuredImage) {
    formData.append("featuredImage", values.featuredImage);
  }

  return formData;
};

export const fetchVacancies = async (params: VacanciesListParams) => {
  const { data } = await apiClient.get<VacancyListResponse>(
    AUTH_API_ENDPOINTS.VACANCIES,
    { params },
  );

  return data;
};

export const fetchVacancyById = async (id: number | string) => {
  const { data } = await apiClient.get<VacancyResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${id}`,
  );

  return data;
};

export const fetchVacancyBySlug = async (slug: string) => {
  const { data } = await apiClient.get<VacancyResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/slug/${slug}`,
  );

  return data;
};

export const createVacancy = async (values: CreateVacancyInput) => {
  const formData = buildVacancyFormData({
    title: values.title,
    excerpt: values.excerpt,
    description: values.description,
    department: values.department,
    location: values.location,
    workplaceType: values.workplaceType,
    employmentType: values.employmentType,
    seniority: values.seniority,
    salaryMin: values.salaryMin,
    salaryMax: values.salaryMax,
    salaryCurrency: values.salaryCurrency,
    externalApplyUrl: values.externalApplyUrl,
    applyEmail: values.applyEmail,
    status: values.status,
    publishedAt: values.publishedAt,
    deadlineAt: values.deadlineAt,
    tagIds: values.tagIds,
    featuredImage: values.featuredImage,
  });

  const { data } = await apiClient.post<VacancyResponse>(
    AUTH_API_ENDPOINTS.VACANCIES,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data;
};

export const updateVacancy = async (
  id: number | string,
  values: UpdateVacancyInput,
) => {
  const formData = buildVacancyFormData({
    title: values.title,
    excerpt: values.excerpt,
    description: values.description,
    department: values.department,
    location: values.location,
    workplaceType: values.workplaceType,
    employmentType: values.employmentType,
    seniority: values.seniority,
    salaryMin: values.salaryMin,
    salaryMax: values.salaryMax,
    salaryCurrency: values.salaryCurrency,
    externalApplyUrl: values.externalApplyUrl,
    applyEmail: values.applyEmail,
    status: values.status,
    publishedAt: values.publishedAt,
    deadlineAt: values.deadlineAt,
    tagIds: values.tagIds,
    featuredImage: values.featuredImage,
  });

  const { data } = await apiClient.patch<VacancyResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data;
};

export const deleteVacancy = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteVacancyResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${id}`,
  );

  return data;
};

export const fetchVacancyApplications = async (
  vacancyId: number | string,
  params: VacancyApplicationsListParams,
) => {
  const { data } = await apiClient.get<VacancyApplicationsResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${vacancyId}/applications`,
    { params },
  );

  return data;
};

export const fetchVacancyApplicationById = async (
  vacancyId: number | string,
  applicationId: number | string,
) => {
  const { data } = await apiClient.get<VacancyApplicationResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${vacancyId}/applications/${applicationId}`,
  );

  return data;
};

export const updateVacancyApplication = async (
  vacancyId: number | string,
  applicationId: number | string,
  payload: UpdateVacancyApplicationInput,
) => {
  const { data } = await apiClient.patch<VacancyApplicationResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${vacancyId}/applications/${applicationId}`,
    payload,
  );

  return data;
};

export const deleteVacancyApplication = async (
  vacancyId: number | string,
  applicationId: number | string,
) => {
  const { data } = await apiClient.delete<DeleteVacancyApplicationResponse>(
    `${AUTH_API_ENDPOINTS.VACANCIES}/${vacancyId}/applications/${applicationId}`,
  );

  return data;
};
