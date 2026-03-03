import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreateGalleryItem,
  GalleryItem,
  GalleryListParams,
  UpdateGalleryItem,
} from "./gallery-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type GalleryResponse = ApiSuccessResponse<GalleryItem>;
export type GalleryListResponse = ApiSuccessResponse<GalleryItem[]>;
export type DeleteGalleryResponse = ApiSuccessResponse<{ message: string }>;

type GalleryFormMultipartPayload = {
  title?: string;
  description?: string;
  occurredAt?: string;
  categoryId?: number;
  images?: Array<{
    imageUrl?: string;
    image?: File;
    position?: number;
  }>;
};

const buildGalleryFormData = (values: GalleryFormMultipartPayload) => {
  const formData = new FormData();

  if (values.title !== undefined) {
    formData.append("title", values.title);
  }

  if (values.description !== undefined) {
    formData.append("description", values.description);
  }

  if (values.occurredAt !== undefined) {
    formData.append("occurredAt", values.occurredAt);
  }

  if (values.categoryId !== undefined) {
    formData.append("categoryId", String(values.categoryId));
  }

  if (values.images && values.images.length > 0) {
    const imagesMeta = values.images.map((image, index) => ({
      position:
        typeof image.position === "number" ? image.position : Number(index),
      imageUrl: image.imageUrl,
    }));

    formData.append("imagesMeta", JSON.stringify(imagesMeta));

    values.images.forEach((image, index) => {
      if (image.image) {
        formData.append(`images[${index}]`, image.image);
      }
    });
  }

  return formData;
};

export const fetchGalleryItems = async (params: GalleryListParams) => {
  const { data } = await apiClient.get<GalleryListResponse>(
    AUTH_API_ENDPOINTS.GALLERY,
    { params },
  );

  return data;
};

export const fetchGalleryItemById = async (id: number | string) => {
  const { data } = await apiClient.get<GalleryResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY}/${id}`,
  );

  return data;
};

export const createGalleryItem = async (values: CreateGalleryItem) => {
  const formData = buildGalleryFormData(values);

  const { data } = await apiClient.post<GalleryResponse>(
    AUTH_API_ENDPOINTS.GALLERY,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateGalleryItem = async (
  id: number | string,
  values: UpdateGalleryItem,
) => {
  const formData = buildGalleryFormData(values);

  const { data } = await apiClient.patch<GalleryResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteGalleryItem = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteGalleryResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY}/${id}`,
  );

  return data;
};
