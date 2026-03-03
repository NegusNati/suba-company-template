import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createBusinessSector,
  deleteBusinessSector,
  fetchBusinessSectorById,
  fetchBusinessSectorBySlug,
  fetchBusinessSectors,
  updateBusinessSector,
  type DeleteBusinessSectorResponse,
} from "./business-sectors-api";
import {
  normalizeBusinessSectorListParams,
  type BusinessSector,
  type BusinessSectorListParams,
  type CreateBusinessSectorInput,
  type UpdateBusinessSectorInput,
} from "./business-sectors-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const businessSectorKeys = {
  all: [AUTH_API_ENDPOINTS.BUSINESS_SECTORS] as const,
  list: (params: BusinessSectorListParams) =>
    [AUTH_API_ENDPOINTS.BUSINESS_SECTORS, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.BUSINESS_SECTORS}/${id}`] as const,
  slug: (slug: string) =>
    [`${AUTH_API_ENDPOINTS.BUSINESS_SECTORS}/slug/${slug}`] as const,
};

export const useBusinessSectorsQuery = (
  params?: Partial<BusinessSectorListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<BusinessSector[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeBusinessSectorListParams(params ?? {});

  return useQuery<ApiSuccessResponse<BusinessSector[]>, Error>({
    queryKey: businessSectorKeys.list(normalizedParams),
    queryFn: () => fetchBusinessSectors(normalizedParams),
    ...options,
  });
};

export const useBusinessSectorByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<BusinessSector>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<BusinessSector>, Error>({
    queryKey: businessSectorKeys.detail(id),
    queryFn: () => fetchBusinessSectorById(id),
    enabled: Boolean(id),
    ...options,
  });
};

export const useBusinessSectorBySlugQuery = (
  slug: string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<BusinessSector>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<BusinessSector>, Error>({
    queryKey: businessSectorKeys.slug(slug),
    queryFn: () => fetchBusinessSectorBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<BusinessSector>,
    Error,
    CreateBusinessSectorInput
  >,
  "mutationFn"
>;

export const useCreateBusinessSectorMutation = (
  options?: CreateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<BusinessSector>,
    Error,
    CreateBusinessSectorInput
  >({
    mutationFn: createBusinessSector,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: businessSectorKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateBusinessSectorInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<BusinessSector>,
    Error,
    UpdateVariables
  >,
  "mutationFn"
>;

export const useUpdateBusinessSectorMutation = (
  options?: UpdateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<BusinessSector>,
    Error,
    UpdateVariables
  >({
    mutationFn: ({ id, payload }) => updateBusinessSector(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: businessSectorKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteBusinessSectorResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteBusinessSectorMutation = (
  options?: DeleteMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteBusinessSectorResponse, Error, number | string>({
    mutationFn: deleteBusinessSector,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: businessSectorKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
