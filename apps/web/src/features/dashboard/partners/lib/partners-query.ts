import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createPartner,
  deletePartner,
  fetchPartnerById,
  fetchPartners,
  updatePartner,
  type DeletePartnerResponse,
} from "./partners-api";
import {
  normalizePartnersListParams,
  type CreatePartnerInput,
  type Partner,
  type PartnerListParams,
  type PartnerUpdatePayload,
} from "./partners-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const partnerKeys = {
  all: [AUTH_API_ENDPOINTS.PARTNER] as const,
  list: (params: PartnerListParams) =>
    [AUTH_API_ENDPOINTS.PARTNER, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.PARTNER}/${id}`] as const,
};

export const usePartnersQuery = (
  params?: Partial<PartnerListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Partner[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizePartnersListParams(params ?? {});

  return useQuery<ApiSuccessResponse<Partner[]>, Error>({
    queryKey: partnerKeys.list(normalizedParams),
    queryFn: () => fetchPartners(normalizedParams),
    ...options,
  });
};

export const usePartnerByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Partner>, Error>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<ApiSuccessResponse<Partner>, Error>({
    queryKey: partnerKeys.detail(id),
    queryFn: () => fetchPartnerById(id),
    enabled: Boolean(id),
    ...options,
  });

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Partner>, Error, CreatePartnerInput>,
  "mutationFn"
>;

export const useCreatePartnerMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Partner>, Error, CreatePartnerInput>({
    mutationFn: createPartner,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = { id: number | string; payload: PartnerUpdatePayload };
type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Partner>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdatePartnerMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Partner>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updatePartner(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeletePartnerResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeletePartnerMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeletePartnerResponse, Error, number | string>({
    mutationFn: deletePartner,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
