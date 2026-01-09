import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createOrgMember,
  deleteOrgMember,
  fetchOrgMemberById,
  fetchOrgMembers,
  updateOrgMember,
  type DeleteOrgMemberResponse,
} from "./org-api";
import {
  normalizeOrgMembersListParams,
  type OrgMember,
  type OrgMembersListParams,
  type CreateOrgMemberInput,
  type UpdateOrgMemberInput,
} from "./org-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

/**
 * Query key factory for cache management
 */
export const orgMemberKeys = {
  all: [AUTH_API_ENDPOINTS.ORG_MEMBERS] as const,
  list: (params: OrgMembersListParams) =>
    [AUTH_API_ENDPOINTS.ORG_MEMBERS, "list", params] as const,
  detail: (id: number | string) =>
    [AUTH_API_ENDPOINTS.ORG_MEMBERS, "detail", String(id)] as const,
};

/**
 * Hook to fetch paginated org members list
 */
export const useOrgMembersQuery = (
  params?: Partial<OrgMembersListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<OrgMember[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeOrgMembersListParams(params ?? {});

  return useQuery<ApiSuccessResponse<OrgMember[]>, Error>({
    queryKey: orgMemberKeys.list(normalizedParams),
    queryFn: () => fetchOrgMembers(normalizedParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch single org member by ID
 */
export const useOrgMemberByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<OrgMember>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<OrgMember>, Error>({
    queryKey: orgMemberKeys.detail(id),
    queryFn: () => fetchOrgMemberById(id),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<OrgMember>,
    Error,
    CreateOrgMemberInput
  >,
  "mutationFn"
>;

/**
 * Hook to create new org member
 */
export const useCreateOrgMemberMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<OrgMember>,
    Error,
    CreateOrgMemberInput
  >({
    mutationFn: (payload) => createOrgMember(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: orgMemberKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateOrgMemberInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<OrgMember>, Error, UpdateVariables>,
  "mutationFn"
>;

/**
 * Hook to update existing org member
 */
export const useUpdateOrgMemberMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<OrgMember>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateOrgMember(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: orgMemberKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteOrgMemberResponse, Error, number | string>,
  "mutationFn"
>;

/**
 * Hook to delete org member
 */
export const useDeleteOrgMemberMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteOrgMemberResponse, Error, number | string>({
    mutationFn: deleteOrgMember,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: orgMemberKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
