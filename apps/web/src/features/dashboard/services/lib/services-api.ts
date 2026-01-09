import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreateServiceInput,
  Service,
  ServiceListParams,
  UpdateServiceInput,
} from "./services-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type ServiceResponse = ApiSuccessResponse<Service>;
export type ServiceListResponse = ApiSuccessResponse<Service[]>;
export type DeleteServiceResponse = ApiSuccessResponse<{ message: string }>;

type ServiceFormMultipartPayload = {
  title?: string;
  excerpt?: string;
  description?:
    | CreateServiceInput["description"]
    | UpdateServiceInput["description"];
  imagesMeta?: CreateServiceInput["imagesMeta"];
  images?: CreateServiceInput["images"];
};

const buildServiceFormData = (values: ServiceFormMultipartPayload) => {
  const formData = new FormData();

  if (values.title !== undefined) {
    formData.append("title", values.title);
  }

  if (values.excerpt) {
    formData.append("excerpt", values.excerpt);
  }

  if (values.description !== undefined && values.description !== null) {
    const descriptionValue =
      typeof values.description === "string"
        ? values.description
        : JSON.stringify(values.description);

    formData.append("description", descriptionValue);
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

export const fetchServices = async (params: ServiceListParams) => {
  const { data } = await apiClient.get<ServiceListResponse>(
    AUTH_API_ENDPOINTS.SERVICES,
    { params },
  );
  return data;
};

export const fetchServiceById = async (
  id: number | string,
  options?: { includeImages?: boolean },
) => {
  const { data } = await apiClient.get<ServiceResponse>(
    `${AUTH_API_ENDPOINTS.SERVICES}/${id}`,
    {
      params:
        options && options.includeImages
          ? { includeImages: String(options.includeImages) }
          : undefined,
    },
  );
  return data;
};

export const createService = async (values: CreateServiceInput) => {
  const formData = buildServiceFormData({
    title: values.title,
    excerpt: values.excerpt,
    description: values.description,
    imagesMeta: values.imagesMeta,
    images: values.images,
  });

  const { data } = await apiClient.post<ServiceResponse>(
    AUTH_API_ENDPOINTS.SERVICES,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateService = async (
  id: number | string,
  values: UpdateServiceInput,
) => {
  const formData = buildServiceFormData({
    title: values.title,
    excerpt: values.excerpt,
    description: values.description,
    imagesMeta: values.imagesMeta,
    images: values.images,
  });

  const { data } = await apiClient.patch<ServiceResponse>(
    `${AUTH_API_ENDPOINTS.SERVICES}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteService = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteServiceResponse>(
    `${AUTH_API_ENDPOINTS.SERVICES}/${id}`,
  );
  return data;
};
