import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createGalleryCategory,
  deleteGalleryCategory,
  fetchGalleryCategories,
  updateGalleryCategory,
} from "./gallery-categories-api";
import {
  normalizeGalleryCategoriesListParams,
  type CreateGalleryCategory,
  type GalleryCategoriesListParams,
  type GalleryCategory,
} from "./gallery-categories-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const galleryCategoryKeys = {
  all: [AUTH_API_ENDPOINTS.GALLERY_CATEGORIES] as const,
  list: (params: GalleryCategoriesListParams) =>
    [AUTH_API_ENDPOINTS.GALLERY_CATEGORIES, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.GALLERY_CATEGORIES}/${id}`] as const,
};

export const useGalleryCategoriesQuery = (
  params?: Partial<GalleryCategoriesListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<GalleryCategory[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeGalleryCategoriesListParams(params ?? {});
  return useQuery<ApiSuccessResponse<GalleryCategory[]>, Error>({
    queryKey: galleryCategoryKeys.list(normalizedParams),
    queryFn: () => fetchGalleryCategories(normalizedParams),
    ...options,
  });
};

export const useCreateGalleryCategoryMutation = (
  options?: Omit<
    UseMutationOptions<
      ApiSuccessResponse<GalleryCategory>,
      Error,
      CreateGalleryCategory
    >,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<GalleryCategory>,
    Error,
    CreateGalleryCategory
  >({
    mutationFn: createGalleryCategory,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: galleryCategoryKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

export const useUpdateGalleryCategoryMutation = (
  options?: Omit<
    UseMutationOptions<
      ApiSuccessResponse<GalleryCategory>,
      Error,
      { id: number | string; payload: CreateGalleryCategory }
    >,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<GalleryCategory>,
    Error,
    { id: number | string; payload: CreateGalleryCategory }
  >({
    mutationFn: ({ id, payload }) => updateGalleryCategory(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: galleryCategoryKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

export const useDeleteGalleryCategoryMutation = (
  options?: Omit<
    UseMutationOptions<
      ApiSuccessResponse<{ message: string }>,
      Error,
      number | string
    >,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<{ message: string }>,
    Error,
    number | string
  >({
    mutationFn: deleteGalleryCategory,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: galleryCategoryKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
