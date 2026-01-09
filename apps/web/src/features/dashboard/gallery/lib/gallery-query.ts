import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import {
  fetchGalleryItems,
  fetchGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  type GalleryDetailResponse,
  type DeleteGalleryResponse,
} from "./gallery-api";
import {
  normalizeGalleryListParams,
  type GalleryListParams,
  type CreateGalleryItem,
  type UpdateGalleryItem,
} from "./gallery-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

/**
 * Query key factory for gallery items
 * Provides consistent cache keys across the application
 */
export const galleryKeys = {
  all: [AUTH_API_ENDPOINTS.GALLERY] as const,
  lists: () => [...galleryKeys.all, "list"] as const,
  list: (params: GalleryListParams) =>
    [...galleryKeys.lists(), params] as const,
  details: () => [...galleryKeys.all, "detail"] as const,
  detail: (id: number) => [...galleryKeys.details(), id] as const,
};

/**
 * Fetch gallery items with pagination and filtering
 */
export const useGalleryItemsQuery = (params: Partial<GalleryListParams>) => {
  const normalizedParams = normalizeGalleryListParams(params);

  return useQuery({
    queryKey: galleryKeys.list(normalizedParams),
    queryFn: () => fetchGalleryItems(normalizedParams),
  });
};

/**
 * Fetch a single gallery item by ID
 */
export const useGalleryItemByIdQuery = (
  id: number,
  options?: Omit<
    UseQueryOptions<GalleryDetailResponse>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: galleryKeys.detail(id),
    queryFn: () => fetchGalleryItemById(id),
    ...options,
  });
};

/**
 * Create gallery item mutation options
 */
type CreateGalleryItemMutationOptions = Omit<
  UseMutationOptions<GalleryDetailResponse, Error, CreateGalleryItem>,
  "mutationFn"
>;

/**
 * Create a new gallery item
 */
export const useCreateGalleryItemMutation = (
  options?: CreateGalleryItemMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<GalleryDetailResponse, Error, CreateGalleryItem>({
    mutationFn: createGalleryItem,
    onSuccess: (...args) => {
      // Invalidate all list queries to refetch with new item
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      onSuccess?.(...args);
    },
    ...(onError && { onError }),
    ...rest,
  });
};

/**
 * Update gallery item mutation options
 */
type UpdateGalleryItemMutationOptions = Omit<
  UseMutationOptions<
    GalleryDetailResponse,
    Error,
    { id: number; data: UpdateGalleryItem }
  >,
  "mutationFn"
>;

/**
 * Update an existing gallery item
 */
export const useUpdateGalleryItemMutation = (
  options?: UpdateGalleryItemMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    GalleryDetailResponse,
    Error,
    { id: number; data: UpdateGalleryItem }
  >({
    mutationFn: ({ id, data }) => updateGalleryItem(id, data),
    onSuccess: (...args) => {
      // Invalidate list queries and specific detail query
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(args[1].id),
      });
      onSuccess?.(...args);
    },
    ...(onError && { onError }),
    ...rest,
  });
};

/**
 * Delete gallery item mutation options
 */
type DeleteGalleryItemMutationOptions = Omit<
  UseMutationOptions<DeleteGalleryResponse, Error, number>,
  "mutationFn"
>;

/**
 * Delete a gallery item
 */
export const useDeleteGalleryItemMutation = (
  options?: DeleteGalleryItemMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteGalleryResponse, Error, number>({
    mutationFn: deleteGalleryItem,
    onSuccess: (...args) => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      // Remove the deleted item from cache
      queryClient.removeQueries({ queryKey: galleryKeys.detail(args[1]) });
      onSuccess?.(...args);
    },
    ...(onError && { onError }),
    ...rest,
  });
};
