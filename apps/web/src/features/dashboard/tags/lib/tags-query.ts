import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { createTag, deleteTag, fetchTags, updateTag } from "./tags-api";
import {
  normalizeTagListParams,
  type CreateTag,
  type Tag,
  type TagListParams,
} from "./tags-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const tagKeys = {
  all: [AUTH_API_ENDPOINTS.TAG] as const,
  list: (params: TagListParams) =>
    [AUTH_API_ENDPOINTS.TAG, "list", params] as const,
  detail: (id: number | string) =>
    [AUTH_API_ENDPOINTS.TAG, "detail", String(id)] as const,
};

export const useTagsQuery = (
  params?: Partial<TagListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Tag[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeTagListParams(params ?? {});
  return useQuery<ApiSuccessResponse<Tag[]>, Error>({
    queryKey: tagKeys.list(normalizedParams),
    queryFn: () => fetchTags(normalizedParams),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Tag>, Error, CreateTag>,
  "mutationFn"
>;

export const useCreateTagMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Tag>, Error, CreateTag>({
    mutationFn: createTag,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = { id: number | string; payload: CreateTag };
type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Tag>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateTagMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Tag>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateTag(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<{ message: string }>,
    Error,
    number | string
  >,
  "mutationFn"
>;

export const useDeleteTagMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<{ message: string }>,
    Error,
    number | string
  >({
    mutationFn: deleteTag,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
