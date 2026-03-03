import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createBlog,
  deleteBlog,
  fetchBlogById,
  fetchBlogBySlug,
  fetchBlogs,
  updateBlog,
  type DeleteBlogResponse,
} from "./blogs-api";
import {
  normalizeBlogsListParams,
  type Blog,
  type BlogsListParams,
  type CreateBlogInput,
  type UpdateBlogInput,
} from "./blogs-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const blogKeys = {
  all: [AUTH_API_ENDPOINTS.BLOG] as const,
  list: (params: BlogsListParams) => [AUTH_API_ENDPOINTS.BLOG, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.BLOG}/${id}`] as const,
  slug: (slug: string) => [`${AUTH_API_ENDPOINTS.BLOG}/slug/${slug}`] as const,
};

export const useBlogsQuery = (
  params?: Partial<BlogsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Blog[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeBlogsListParams(params ?? {});

  return useQuery<ApiSuccessResponse<Blog[]>, Error>({
    queryKey: blogKeys.list(normalizedParams),
    queryFn: () => fetchBlogs(normalizedParams),
    ...options,
  });
};

export const useBlogByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Blog>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<Blog>, Error>({
    queryKey: blogKeys.detail(id),
    queryFn: () => fetchBlogById(id, { includeTags: true }),
    enabled: Boolean(id),
    ...options,
  });
};

export const useBlogBySlugQuery = (
  slug: string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Blog>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<Blog>, Error>({
    queryKey: blogKeys.slug(slug),
    queryFn: () => fetchBlogBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Blog>, Error, CreateBlogInput>,
  "mutationFn"
>;

export const useCreateBlogMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<Blog>,
    Error,
    CreateBlogInput & { authorId: string }
  >({
    mutationFn: (payload) => createBlog(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateBlogInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Blog>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateBlogMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Blog>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateBlog(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteBlogResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteBlogMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteBlogResponse, Error, number | string>({
    mutationFn: deleteBlog,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
