import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  fetchPublicVacancies,
  fetchPublicVacancyBySlug,
  submitVacancyApplication,
  type SubmitVacancyApplicationResponse,
} from "./careers-api";
import {
  normalizePublicVacancyListParams,
  type PublicVacancyDetail,
  type PublicVacancyListItem,
  type PublicVacancyListParams,
  type VacancyApplicationFormValues,
} from "./careers-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const careersKeys = {
  all: [LANDING_API_ENDPOINTS.VACANCIES_CLIENT] as const,
  list: (params: PublicVacancyListParams) =>
    [LANDING_API_ENDPOINTS.VACANCIES_CLIENT, params] as const,
  slug: (slug: string) =>
    [`${LANDING_API_ENDPOINTS.VACANCIES_CLIENT}/slug/${slug}`] as const,
};

export const useCareersListQuery = (
  params?: Partial<PublicVacancyListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<PublicVacancyListItem[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizePublicVacancyListParams(params ?? {});

  return useQuery<ApiSuccessResponse<PublicVacancyListItem[]>, Error>({
    queryKey: careersKeys.list(normalizedParams),
    queryFn: () => fetchPublicVacancies(normalizedParams),
    ...options,
  });
};

export const useCareerBySlugQuery = (
  slug: string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<PublicVacancyDetail>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<PublicVacancyDetail>, Error>({
    queryKey: careersKeys.slug(slug),
    queryFn: () => fetchPublicVacancyBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
};

type SubmitVariables = {
  vacancyId: number | string;
  payload: VacancyApplicationFormValues;
};

type SubmitMutationOptions = Omit<
  UseMutationOptions<SubmitVacancyApplicationResponse, Error, SubmitVariables>,
  "mutationFn"
>;

export const useSubmitVacancyApplicationMutation = (
  options?: SubmitMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<SubmitVacancyApplicationResponse, Error, SubmitVariables>({
    mutationFn: ({ vacancyId, payload }) =>
      submitVacancyApplication(vacancyId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: careersKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
