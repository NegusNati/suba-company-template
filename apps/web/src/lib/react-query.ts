import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

import apiClient from "./axios";

export function useGetData<T>(
  endpoint: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    [key: string]: unknown;
  },
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<T>, Error, ApiSuccessResponse<T>>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<ApiSuccessResponse<T>, Error> {
  return useQuery<ApiSuccessResponse<T>, Error>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccessResponse<T>>(endpoint, {
        params,
      });
      return response.data;
    },
    ...options,
  });
}

export function useGetDataById<T>(
  endpoint: string,
  id: string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<T>, Error, ApiSuccessResponse<T>>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<ApiSuccessResponse<T>, Error> {
  return useQuery<ApiSuccessResponse<T>, Error>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccessResponse<T>>(
        `${endpoint}/${id}`,
      );
      return response.data;
    },
    ...options,
  });
}

// Mutation hook for JSON data
export function useCreateData<TData, TVariables = unknown>(
  endpoint: string,
  invalidateQueries: string[],
  options?: Omit<
    UseMutationOptions<ApiSuccessResponse<TData>, Error, TVariables>,
    "mutationFn"
  >,
): UseMutationResult<ApiSuccessResponse<TData>, Error, TVariables> {
  const queryClient = useQueryClient();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation<ApiSuccessResponse<TData>, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      const response = await apiClient.post<ApiSuccessResponse<TData>>(
        endpoint,
        data,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
      userOnSuccess?.(...args);
    },
    onError: userOnError,
    ...restOptions,
  });
}

// Mutation hook for FormData (multipart)
export function useCreateDataForm<TData, TVariables = FormData>(
  endpoint: string,
  invalidateQueries: string[],
  options?: Omit<
    UseMutationOptions<ApiSuccessResponse<TData>, Error, TVariables>,
    "mutationFn"
  >,
): UseMutationResult<ApiSuccessResponse<TData>, Error, TVariables> {
  const queryClient = useQueryClient();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation<ApiSuccessResponse<TData>, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      const response = await apiClient.post<ApiSuccessResponse<TData>>(
        endpoint,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
      userOnSuccess?.(...args);
    },
    onError: userOnError,
    ...restOptions,
  });
}

// Update/PUT hook
export function useUpdateData<TData, TVariables = unknown>(
  endpoint: string,
  invalidateQueries: string[],
  options?: Omit<
    UseMutationOptions<
      ApiSuccessResponse<TData>,
      Error,
      TVariables & { id: string }
    >,
    "mutationFn"
  >,
): UseMutationResult<
  ApiSuccessResponse<TData>,
  Error,
  TVariables & { id: string }
> {
  const queryClient = useQueryClient();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation<
    ApiSuccessResponse<TData>,
    Error,
    TVariables & { id: string }
  >({
    mutationFn: async (data: TVariables & { id: string }) => {
      const { id, ...updateData } = data;
      const response = await apiClient.patch<ApiSuccessResponse<TData>>(
        `${endpoint}/${id}`,
        updateData,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
      userOnSuccess?.(...args);
    },
    onError: userOnError,
    ...restOptions,
  });
}

// Update/PUT hook for FormData (multipart)
export function useUpdateDataForm<TData>(
  endpoint: string,
  invalidateQueries: string[],
  options?: Omit<
    UseMutationOptions<
      ApiSuccessResponse<TData>,
      Error,
      { id: string; formData: FormData }
    >,
    "mutationFn"
  >,
): UseMutationResult<
  ApiSuccessResponse<TData>,
  Error,
  { id: string; formData: FormData }
> {
  const queryClient = useQueryClient();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation<
    ApiSuccessResponse<TData>,
    Error,
    { id: string; formData: FormData }
  >({
    mutationFn: async ({ id, formData }) => {
      const response = await apiClient.patch<ApiSuccessResponse<TData>>(
        `${endpoint}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
      userOnSuccess?.(...args);
    },
    onError: userOnError,
    ...restOptions,
  });
}

// Delete hook
export function useDeleteData<TData = unknown>(
  endpoint: string,
  invalidateQueries: string[],
  options?: Omit<
    UseMutationOptions<ApiSuccessResponse<TData>, Error, string>,
    "mutationFn"
  >,
): UseMutationResult<ApiSuccessResponse<TData>, Error, string> {
  const queryClient = useQueryClient();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation<ApiSuccessResponse<TData>, Error, string>({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiSuccessResponse<TData>>(
        `${endpoint}/${id}`,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
      userOnSuccess?.(...args);
    },
    onError: userOnError,
    ...restOptions,
  });
}
