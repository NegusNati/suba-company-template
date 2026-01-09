import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createSocial,
  deleteSocial,
  fetchSocials,
  updateSocial,
} from "./socials-api";
import {
  normalizeSocialsListParams,
  type CreateSocial,
  type Social,
  type SocialsListParams,
  type UpdateSocial,
} from "./socials-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const socialKeys = {
  all: [AUTH_API_ENDPOINTS.SOCIALS] as const,
  list: (params: SocialsListParams) =>
    [AUTH_API_ENDPOINTS.SOCIALS, "list", params] as const,
  detail: (id: number | string) =>
    [AUTH_API_ENDPOINTS.SOCIALS, "detail", String(id)] as const,
};

export const useSocialsQuery = (
  params?: Partial<SocialsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Social[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeSocialsListParams(params ?? {});
  return useQuery<ApiSuccessResponse<Social[]>, Error>({
    queryKey: socialKeys.list(normalizedParams),
    queryFn: () => fetchSocials(normalizedParams),
    ...options,
  });
};

type CreateOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Social>, Error, CreateSocial>,
  "mutationFn"
>;

export const useCreateSocialMutation = (options?: CreateOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Social>, Error, CreateSocial>({
    mutationFn: createSocial,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = UpdateSocial & { id: number | string };
type UpdateOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Social>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateSocialMutation = (options?: UpdateOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Social>, Error, UpdateVariables>({
    mutationFn: (payload) => updateSocial(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<{ message: string }>,
    Error,
    number | string
  >,
  "mutationFn"
>;

export const useDeleteSocialMutation = (options?: DeleteOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<{ message: string }>,
    Error,
    number | string
  >({
    mutationFn: deleteSocial,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
