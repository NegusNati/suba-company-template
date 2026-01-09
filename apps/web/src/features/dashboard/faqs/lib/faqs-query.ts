import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { createFaq, deleteFaq, fetchFaqs, updateFaq } from "./faqs-api";
import {
  normalizeFaqsListParams,
  type CreateFaq,
  type Faq,
  type FaqsListParams,
  type UpdateFaq,
} from "./faqs-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const faqKeys = {
  all: [AUTH_API_ENDPOINTS.FAQS] as const,
  list: (params: FaqsListParams) =>
    [AUTH_API_ENDPOINTS.FAQS, "list", params] as const,
  detail: (id: number | string) =>
    [AUTH_API_ENDPOINTS.FAQS, "detail", String(id)] as const,
};

export const useFaqsQuery = (
  params?: Partial<FaqsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Faq[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeFaqsListParams(params ?? {});
  return useQuery<ApiSuccessResponse<Faq[]>, Error>({
    queryKey: faqKeys.list(normalizedParams),
    queryFn: () => fetchFaqs(normalizedParams),
    ...options,
  });
};

type CreateOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Faq>, Error, CreateFaq>,
  "mutationFn"
>;

export const useCreateFaqMutation = (options?: CreateOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Faq>, Error, CreateFaq>({
    mutationFn: createFaq,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = UpdateFaq & { id: number | string };
type UpdateOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Faq>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateFaqMutation = (options?: UpdateOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Faq>, Error, UpdateVariables>({
    mutationFn: (payload) => updateFaq(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all });
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

export const useDeleteFaqMutation = (options?: DeleteOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<{ message: string }>,
    Error,
    number | string
  >({
    mutationFn: deleteFaq,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
