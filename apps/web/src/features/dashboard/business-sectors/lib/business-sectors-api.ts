import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  BusinessSector,
  BusinessSectorListParams,
  CreateBusinessSectorInput,
  UpdateBusinessSectorInput,
} from "./business-sectors-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type BusinessSectorResponse = ApiSuccessResponse<BusinessSector>;
export type BusinessSectorListResponse = ApiSuccessResponse<BusinessSector[]>;
export type DeleteBusinessSectorResponse = ApiSuccessResponse<{
  message: string;
}>;

const buildBusinessSectorFormData = (
  values: CreateBusinessSectorInput | UpdateBusinessSectorInput,
) => {
  const formData = new FormData();

  if (values.title !== undefined) formData.append("title", values.title);
  if (values.excerpt) formData.append("excerpt", values.excerpt);
  if (values.history !== undefined) formData.append("history", values.history);
  if (values.publishDate) formData.append("publishDate", values.publishDate);
  if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber);
  if (values.emailAddress) formData.append("emailAddress", values.emailAddress);
  if (values.address) formData.append("address", values.address);
  if (values.facebookUrl) formData.append("facebookUrl", values.facebookUrl);
  if (values.instagramUrl) formData.append("instagramUrl", values.instagramUrl);
  if (values.linkedinUrl) formData.append("linkedinUrl", values.linkedinUrl);
  if (values.featuredImageUrl) {
    formData.append("featuredImageUrl", values.featuredImageUrl);
  }
  if (values.featuredImageFile) {
    formData.append("featuredImage", values.featuredImageFile);
  }

  if (values.stats !== undefined) {
    formData.append("stats", JSON.stringify(values.stats));
  }

  if (values.services !== undefined) {
    const servicesMeta = values.services.map((service, index) => ({
      title: service.title,
      description: service.description,
      imageUrl: service.imageUrl,
      position: service.position ?? index,
    }));
    formData.append("servicesMeta", JSON.stringify(servicesMeta));

    values.services.forEach((service, index) => {
      if (service.imageFile) {
        formData.append(`services[${index}]`, service.imageFile);
      }
    });
  }

  if (values.gallery !== undefined) {
    const galleryMeta = values.gallery.map((image, index) => ({
      imageUrl: image.imageUrl,
      position: image.position ?? index,
    }));
    formData.append("galleryMeta", JSON.stringify(galleryMeta));

    values.gallery.forEach((image, index) => {
      if (image.imageFile) {
        formData.append(`gallery[${index}]`, image.imageFile);
      }
    });
  }

  return formData;
};

export const fetchBusinessSectors = async (
  params: BusinessSectorListParams,
) => {
  const { data } = await apiClient.get<BusinessSectorListResponse>(
    AUTH_API_ENDPOINTS.BUSINESS_SECTORS,
    { params },
  );

  return data;
};

export const fetchBusinessSectorById = async (id: number | string) => {
  const { data } = await apiClient.get<BusinessSectorResponse>(
    `${AUTH_API_ENDPOINTS.BUSINESS_SECTORS}/${id}`,
  );
  return data;
};

export const fetchBusinessSectorBySlug = async (slug: string) => {
  const { data } = await apiClient.get<BusinessSectorResponse>(
    `${AUTH_API_ENDPOINTS.BUSINESS_SECTORS}/slug/${slug}`,
  );
  return data;
};

export const createBusinessSector = async (
  values: CreateBusinessSectorInput,
) => {
  const formData = buildBusinessSectorFormData(values);

  const { data } = await apiClient.post<BusinessSectorResponse>(
    AUTH_API_ENDPOINTS.BUSINESS_SECTORS,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateBusinessSector = async (
  id: number | string,
  values: UpdateBusinessSectorInput,
) => {
  const formData = buildBusinessSectorFormData(values);

  const { data } = await apiClient.patch<BusinessSectorResponse>(
    `${AUTH_API_ENDPOINTS.BUSINESS_SECTORS}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteBusinessSector = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteBusinessSectorResponse>(
    `${AUTH_API_ENDPOINTS.BUSINESS_SECTORS}/${id}`,
  );

  return data;
};
