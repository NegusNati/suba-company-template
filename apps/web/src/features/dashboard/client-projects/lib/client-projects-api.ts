import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  ClientProject,
  ClientProjectsListParams,
  CreateClientProjectInput,
  UpdateClientProjectInput,
} from "./client-projects-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type ClientProjectResponse = ApiSuccessResponse<ClientProject>;
export type ClientProjectsListResponse = ApiSuccessResponse<ClientProject[]>;
export type DeleteClientProjectResponse = ApiSuccessResponse<{
  message: string;
}>;

type ClientProjectFormMultipartPayload = {
  title?: string;
  excerpt?: string;
  overview?: string;
  clientId?: number;
  projectScope?: string;
  impact?: string | null;
  problem?: string | null;
  process?: string | null;
  deliverable?: string | null;
  serviceId?: number;
  tagIds?: number[];
  imagesMeta?: Array<{ position: number; caption?: string }>;
  images?: File[];
};

const buildClientProjectFormData = (
  values: ClientProjectFormMultipartPayload,
) => {
  const formData = new FormData();

  if (values.title !== undefined) {
    formData.append("title", values.title);
  }

  if (values.excerpt !== undefined) {
    formData.append("excerpt", values.excerpt);
  }

  if (values.overview !== undefined) {
    formData.append("overview", values.overview);
  }

  if (values.clientId !== undefined) {
    formData.append("clientId", String(values.clientId));
  }

  if (values.projectScope !== undefined) {
    formData.append("projectScope", values.projectScope);
  }

  if (values.impact !== undefined && values.impact !== null) {
    formData.append("impact", values.impact);
  }

  if (values.problem !== undefined && values.problem !== null) {
    formData.append("problem", values.problem);
  }

  if (values.process !== undefined && values.process !== null) {
    formData.append("process", values.process);
  }

  if (values.deliverable !== undefined && values.deliverable !== null) {
    formData.append("deliverable", values.deliverable);
  }

  if (values.serviceId !== undefined) {
    formData.append("serviceId", String(values.serviceId));
  }

  if (values.tagIds && values.tagIds.length > 0) {
    formData.append("tagIds", JSON.stringify(values.tagIds));
  }

  if (values.imagesMeta && values.imagesMeta.length > 0) {
    formData.append("imagesMeta", JSON.stringify(values.imagesMeta));
  }

  if (values.images && values.images.length > 0) {
    values.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
  }

  return formData;
};

export const fetchClientProjects = async (params: ClientProjectsListParams) => {
  const { data } = await apiClient.get<ClientProjectsListResponse>(
    AUTH_API_ENDPOINTS.CLIENT_PROJECTS,
    { params },
  );

  return data;
};

export const fetchClientProjectById = async (id: number | string) => {
  const { data } = await apiClient.get<ClientProjectResponse>(
    `${AUTH_API_ENDPOINTS.CLIENT_PROJECTS}/${id}`,
    {
      params: {
        includeRelations: "true",
      },
    },
  );

  return data;
};

export const createClientProject = async (values: CreateClientProjectInput) => {
  const formData = buildClientProjectFormData({
    title: values.title,
    excerpt: values.excerpt,
    overview: values.overview,
    clientId: values.clientId,
    projectScope: values.projectScope,
    impact: values.impact,
    problem: values.problem,
    process: values.process,
    deliverable: values.deliverable,
    serviceId: values.serviceId,
    tagIds: values.tagIds,
    imagesMeta: values.imagesMeta,
    images: values.images,
  });

  const { data } = await apiClient.post<ClientProjectResponse>(
    AUTH_API_ENDPOINTS.CLIENT_PROJECTS,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateClientProject = async (
  id: number | string,
  values: UpdateClientProjectInput,
) => {
  const formData = buildClientProjectFormData({
    title: values.title,
    excerpt: values.excerpt,
    overview: values.overview,
    clientId: values.clientId,
    projectScope: values.projectScope,
    impact: values.impact ?? null,
    problem: values.problem ?? null,
    process: values.process ?? null,
    deliverable: values.deliverable ?? null,
    serviceId: values.serviceId,
    tagIds: values.tagIds,
    imagesMeta: values.imagesMeta,
    images: values.images,
  });

  const { data } = await apiClient.patch<ClientProjectResponse>(
    `${AUTH_API_ENDPOINTS.CLIENT_PROJECTS}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteClientProject = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteClientProjectResponse>(
    `${AUTH_API_ENDPOINTS.CLIENT_PROJECTS}/${id}`,
  );

  return data;
};
