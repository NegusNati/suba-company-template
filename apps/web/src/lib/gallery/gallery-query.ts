import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  fetchPublicGallery,
  fetchPublicGalleryCategories,
} from "./gallery-api";
import {
  normalizePublicGalleryCategoryParams,
  normalizePublicGalleryParams,
  type PublicGalleryCategoryParams,
  type PublicGalleryParams,
} from "./gallery-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const publicGalleryKeys = {
  items: [LANDING_API_ENDPOINTS.GALLERY_CLIENT] as const,
  itemList: (params: PublicGalleryParams) =>
    [LANDING_API_ENDPOINTS.GALLERY_CLIENT, params] as const,
  categories: [LANDING_API_ENDPOINTS.GALLERY_CATEGORIES_CLIENT] as const,
  categoryList: (params: PublicGalleryCategoryParams) =>
    [LANDING_API_ENDPOINTS.GALLERY_CATEGORIES_CLIENT, params] as const,
};

export const publicGalleryQueryOptions = (
  params?: Partial<PublicGalleryParams>,
) => {
  const normalizedParams = normalizePublicGalleryParams(params);
  return queryOptions({
    queryKey: publicGalleryKeys.itemList(normalizedParams),
    queryFn: () => fetchPublicGallery(normalizedParams),
  });
};

export const publicGalleryCategoriesQueryOptions = (
  params?: Partial<PublicGalleryCategoryParams>,
) => {
  const normalizedParams = normalizePublicGalleryCategoryParams(params);
  return queryOptions({
    queryKey: publicGalleryKeys.categoryList(normalizedParams),
    queryFn: () => fetchPublicGalleryCategories(normalizedParams),
  });
};

export const usePublicGalleryQuery = (params?: Partial<PublicGalleryParams>) =>
  useQuery(publicGalleryQueryOptions(params));

export const usePublicGalleryCategoriesQuery = (
  params?: Partial<PublicGalleryCategoryParams>,
) => useQuery(publicGalleryCategoriesQueryOptions(params));
