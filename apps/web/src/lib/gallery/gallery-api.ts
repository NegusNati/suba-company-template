import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  PublicGalleryCategory,
  PublicGalleryCategoryParams,
  PublicGalleryItem,
  PublicGalleryParams,
} from "./gallery-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type PublicGalleryResponse = ApiSuccessResponse<PublicGalleryItem[]>;
export type PublicGalleryCategoriesResponse = ApiSuccessResponse<
  PublicGalleryCategory[]
>;

export const fetchPublicGallery = async (params?: PublicGalleryParams) => {
  const { data } = await apiClient.get<PublicGalleryResponse>(
    LANDING_API_ENDPOINTS.GALLERY_CLIENT,
    { params },
  );
  return data;
};

export const fetchPublicGalleryCategories = async (
  params?: PublicGalleryCategoryParams,
) => {
  const { data } = await apiClient.get<PublicGalleryCategoriesResponse>(
    LANDING_API_ENDPOINTS.GALLERY_CATEGORIES_CLIENT,
    { params },
  );
  return data;
};
