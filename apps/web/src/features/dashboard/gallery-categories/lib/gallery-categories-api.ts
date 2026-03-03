import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreateGalleryCategory,
  GalleryCategoriesListParams,
  GalleryCategory,
} from "./gallery-categories-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type GalleryCategoryResponse = ApiSuccessResponse<GalleryCategory>;
export type GalleryCategoryListResponse = ApiSuccessResponse<GalleryCategory[]>;

export const fetchGalleryCategories = async (
  params: GalleryCategoriesListParams,
) => {
  const { data } = await apiClient.get<GalleryCategoryListResponse>(
    AUTH_API_ENDPOINTS.GALLERY_CATEGORIES,
    { params },
  );

  return data;
};

export const createGalleryCategory = async (payload: CreateGalleryCategory) => {
  const { data } = await apiClient.post<GalleryCategoryResponse>(
    AUTH_API_ENDPOINTS.GALLERY_CATEGORIES,
    payload,
  );

  return data;
};

export const updateGalleryCategory = async (
  id: number | string,
  payload: CreateGalleryCategory,
) => {
  const { data } = await apiClient.patch<GalleryCategoryResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY_CATEGORIES}/${id}`,
    payload,
  );

  return data;
};

export const deleteGalleryCategory = async (id: number | string) => {
  const { data } = await apiClient.delete<
    ApiSuccessResponse<{ message: string }>
  >(`${AUTH_API_ENDPOINTS.GALLERY_CATEGORIES}/${id}`);

  return data;
};
