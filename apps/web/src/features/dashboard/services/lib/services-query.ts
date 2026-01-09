import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createService,
  deleteService,
  fetchServiceById,
  fetchServices,
  updateService,
  type DeleteServiceResponse,
} from "./services-api";
import {
  normalizeServicesListParams,
  type CreateServiceInput,
  type Service,
  type ServiceListParams,
  type UpdateServiceInput,
} from "./services-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const serviceKeys = {
  all: [AUTH_API_ENDPOINTS.SERVICES] as const,
  list: (params: ServiceListParams) =>
    [AUTH_API_ENDPOINTS.SERVICES, "list", params] as const,
  detail: (id: number | string) =>
    [AUTH_API_ENDPOINTS.SERVICES, "detail", String(id)] as const,
};

export const useServicesQuery = (
  params?: Partial<ServiceListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Service[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeServicesListParams(params ?? {});

  return useQuery<ApiSuccessResponse<Service[]>, Error>({
    queryKey: serviceKeys.list(normalizedParams),
    queryFn: () => fetchServices(normalizedParams),
    ...options,
  });
};

export const useServiceByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Service>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<Service>, Error>({
    queryKey: serviceKeys.detail(id),
    queryFn: () => fetchServiceById(id, { includeImages: true }),
    enabled: Boolean(id),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Service>, Error, CreateServiceInput>,
  "mutationFn"
>;

export const useCreateServiceMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Service>, Error, CreateServiceInput>({
    mutationFn: createService,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateServiceInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Service>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateServiceMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Service>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateService(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteServiceResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteServiceMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteServiceResponse, Error, number | string>({
    mutationFn: deleteService,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
