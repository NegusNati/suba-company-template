import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createClientProject,
  deleteClientProject,
  fetchClientProjectById,
  fetchClientProjects,
  updateClientProject,
  type DeleteClientProjectResponse,
} from "./client-projects-api";
import {
  normalizeClientProjectsListParams,
  type ClientProject,
  type ClientProjectsListParams,
  type CreateClientProjectInput,
  type UpdateClientProjectInput,
} from "./client-projects-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const clientProjectKeys = {
  all: [AUTH_API_ENDPOINTS.CLIENT_PROJECTS] as const,
  list: (params: ClientProjectsListParams) =>
    [AUTH_API_ENDPOINTS.CLIENT_PROJECTS, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.CLIENT_PROJECTS}/${id}`] as const,
};

export const useClientProjectsQuery = (
  params?: Partial<ClientProjectsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<ClientProject[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeClientProjectsListParams(params ?? {});

  return useQuery<ApiSuccessResponse<ClientProject[]>, Error>({
    queryKey: clientProjectKeys.list(normalizedParams),
    queryFn: () => fetchClientProjects(normalizedParams),
    ...options,
  });
};

export const useClientProjectByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<ClientProject>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<ClientProject>, Error>({
    queryKey: clientProjectKeys.detail(id),
    queryFn: () => fetchClientProjectById(id),
    enabled: Boolean(id),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<ClientProject>,
    Error,
    CreateClientProjectInput
  >,
  "mutationFn"
>;

export const useCreateClientProjectMutation = (
  options?: CreateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<ClientProject>,
    Error,
    CreateClientProjectInput
  >({
    mutationFn: createClientProject,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: clientProjectKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateClientProjectInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<ClientProject>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateClientProjectMutation = (
  options?: UpdateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<ClientProject>, Error, UpdateVariables>(
    {
      mutationFn: ({ id, payload }) => updateClientProject(id, payload),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: clientProjectKeys.all });
        onSuccess?.(...args);
      },
      onError,
      ...rest,
    },
  );
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteClientProjectResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteClientProjectMutation = (
  options?: DeleteMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteClientProjectResponse, Error, number | string>({
    mutationFn: deleteClientProject,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: clientProjectKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
