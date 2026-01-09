import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonialById,
  fetchTestimonials,
  updateTestimonial,
  type DeleteTestimonialResponse,
} from "./testimonials-api";
import {
  normalizeTestimonialsListParams,
  type CreateTestimonialInput,
  type Testimonial,
  type TestimonialsListParams,
  type TestimonialUpdatePayload,
} from "./testimonials-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const testimonialKeys = {
  all: [AUTH_API_ENDPOINTS.TESTIMONIALS] as const,
  list: (params: TestimonialsListParams) =>
    [AUTH_API_ENDPOINTS.TESTIMONIALS, "list", params] as const,
  detail: (id: number | string) =>
    [AUTH_API_ENDPOINTS.TESTIMONIALS, "detail", String(id)] as const,
};

export const useTestimonialsQuery = (
  params?: Partial<TestimonialsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Testimonial[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeTestimonialsListParams(params ?? {});

  return useQuery<ApiSuccessResponse<Testimonial[]>, Error>({
    queryKey: testimonialKeys.list(normalizedParams),
    queryFn: () => fetchTestimonials(normalizedParams),
    ...options,
  });
};

export const useTestimonialByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Testimonial>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<Testimonial>, Error>({
    queryKey: testimonialKeys.detail(id),
    queryFn: () => fetchTestimonialById(id),
    enabled: Boolean(id),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<Testimonial>,
    Error,
    CreateTestimonialInput
  >,
  "mutationFn"
>;

export const useCreateTestimonialMutation = (
  options?: CreateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<Testimonial>,
    Error,
    CreateTestimonialInput
  >({
    mutationFn: createTestimonial,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: TestimonialUpdatePayload;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Testimonial>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateTestimonialMutation = (
  options?: UpdateMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Testimonial>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateTestimonial(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteTestimonialResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteTestimonialMutation = (
  options?: DeleteMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteTestimonialResponse, Error, number | string>({
    mutationFn: deleteTestimonial,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
