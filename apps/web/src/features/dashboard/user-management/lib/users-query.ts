import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createUser,
  deleteUser,
  fetchUserById,
  fetchUsers,
  updateUser,
  assignUserRole,
  fetchRoles,
  type DeleteUserResponse,
} from "./users-api";
import {
  normalizeUsersListParams,
  type User,
  type UsersListParams,
  type CreateUserInput,
  type UpdateUserInput,
  type AssignRoleInput,
  type RoleOption,
} from "./users-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const userKeys = {
  all: [AUTH_API_ENDPOINTS.USERS] as const,
  list: (params: UsersListParams) =>
    [AUTH_API_ENDPOINTS.USERS, params] as const,
  detail: (id: string) => [`${AUTH_API_ENDPOINTS.USERS}/${id}`] as const,
  roles: () => [`${AUTH_API_ENDPOINTS.USERS}/roles`] as const,
};

export const useUsersQuery = (
  params?: Partial<UsersListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<User[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeUsersListParams(params ?? {});

  return useQuery<ApiSuccessResponse<User[]>, Error>({
    queryKey: userKeys.list(normalizedParams),
    queryFn: () => fetchUsers(normalizedParams),
    ...options,
  });
};

export const useUserByIdQuery = (
  id: string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<User>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<User>, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserById(id),
    enabled: Boolean(id),
    ...options,
  });
};

export const useRolesQuery = (
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<RoleOption[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<RoleOption[]>, Error>({
    queryKey: userKeys.roles(),
    queryFn: fetchRoles,
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<User>, Error, CreateUserInput>,
  "mutationFn"
>;

export const useCreateUserMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<User>, Error, CreateUserInput>({
    mutationFn: createUser,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: string;
  payload: UpdateUserInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<User>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateUserMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<User>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteUserResponse, Error, string>,
  "mutationFn"
>;

export const useDeleteUserMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteUserResponse, Error, string>({
    mutationFn: deleteUser,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type AssignRoleVariables = {
  id: string;
  role: AssignRoleInput;
};

type AssignRoleMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<User>, Error, AssignRoleVariables>,
  "mutationFn"
>;

export const useAssignRoleMutation = (options?: AssignRoleMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<User>, Error, AssignRoleVariables>({
    mutationFn: ({ id, role }) => assignUserRole(id, role),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

// Social platform type from the socials API
export interface SocialPlatform {
  id: number;
  title: string;
  iconUrl: string | null;
  baseUrl: string;
}

// Query hook to fetch available social platforms
export const useSocialsListQuery = (
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<SocialPlatform[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<SocialPlatform[]>, Error>({
    queryKey: [AUTH_API_ENDPOINTS.SOCIALS, { page: 1, limit: 100 }] as const,
    queryFn: async () => {
      // Use the existing socials-api module to fetch the list
      const { fetchSocials } = await import(
        "@/features/dashboard/socials/lib/socials-api"
      );
      return fetchSocials({ page: 1, limit: 100 });
    },
    ...options,
  });
};
