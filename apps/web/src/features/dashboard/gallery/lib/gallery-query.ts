import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createGalleryItem,
  deleteGalleryItem,
  fetchGalleryItemById,
  fetchGalleryItems,
  updateGalleryItem,
} from "./gallery-api";
import {
  normalizeGalleryListParams,
  type CreateGalleryItem,
  type GalleryItem,
  type GalleryListParams,
  type UpdateGalleryItem,
} from "./gallery-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const galleryKeys = {
  all: [AUTH_API_ENDPOINTS.GALLERY] as const,
  list: (params: GalleryListParams) =>
    [AUTH_API_ENDPOINTS.GALLERY, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.GALLERY}/${id}`] as const,
};

export const useGalleryItemsQuery = (
  params?: Partial<GalleryListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<GalleryItem[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeGalleryListParams(params ?? {});
  return useQuery<ApiSuccessResponse<GalleryItem[]>, Error>({
    queryKey: galleryKeys.list(normalizedParams),
    queryFn: () => fetchGalleryItems(normalizedParams),
    ...options,
  });
};

export const useGalleryItemByIdQuery = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<GalleryItem>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<GalleryItem>, Error>({
    queryKey: galleryKeys.detail(id),
    queryFn: () => fetchGalleryItemById(id),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<GalleryItem>, Error, CreateGalleryItem>,
  "mutationFn"
>;

export const useCreateGalleryItemMutation = (
  options?: CreateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<GalleryItem>, Error, CreateGalleryItem>(
    {
      mutationFn: createGalleryItem,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: galleryKeys.all });
        onSuccess?.(...args);
      },
      onError,
      ...rest,
    },
  );
};

type UpdateVariables = {
  id: number;
  data: UpdateGalleryItem;
};

export const useUpdateGalleryItemMutation = (
  options?: Omit<
    UseMutationOptions<ApiSuccessResponse<GalleryItem>, Error, UpdateVariables>,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<GalleryItem>, Error, UpdateVariables>({
    mutationFn: ({ id, data }) => updateGalleryItem(id, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

export const useDeleteGalleryItemMutation = (
  options?: Omit<
    UseMutationOptions<ApiSuccessResponse<{ message: string }>, Error, number>,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<{ message: string }>, Error, number>({
    mutationFn: deleteGalleryItem,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
