import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createVacancy,
  deleteVacancy,
  fetchVacancies,
  fetchVacancyById,
  fetchVacancyBySlug,
  fetchVacancyApplications,
  fetchVacancyApplicationById,
  updateVacancy,
  updateVacancyApplication,
  deleteVacancyApplication,
  type DeleteVacancyApplicationResponse,
  type DeleteVacancyResponse,
} from "./vacancies-api";
import {
  normalizeVacanciesListParams,
  normalizeVacancyApplicationsListParams,
  type CreateVacancyInput,
  type UpdateVacancyInput,
  type VacanciesListParams,
  type Vacancy,
  type VacancyApplication,
  type VacancyApplicationsListParams,
  type UpdateVacancyApplicationInput,
} from "./vacancies-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const vacancyKeys = {
  all: [AUTH_API_ENDPOINTS.VACANCIES] as const,
  list: (params: VacanciesListParams) =>
    [AUTH_API_ENDPOINTS.VACANCIES, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.VACANCIES}/${id}`] as const,
  slug: (slug: string) =>
    [`${AUTH_API_ENDPOINTS.VACANCIES}/slug/${slug}`] as const,
  applications: (
    vacancyId: number | string,
    params: VacancyApplicationsListParams,
  ) =>
    [
      `${AUTH_API_ENDPOINTS.VACANCIES}/${vacancyId}/applications`,
      params,
    ] as const,
  applicationDetail: (
    vacancyId: number | string,
    applicationId: number | string,
  ) =>
    [
      `${AUTH_API_ENDPOINTS.VACANCIES}/${vacancyId}/applications/${applicationId}`,
    ] as const,
};

export const useVacanciesQuery = (
  params?: Partial<VacanciesListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Vacancy[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeVacanciesListParams(params ?? {});

  return useQuery<ApiSuccessResponse<Vacancy[]>, Error>({
    queryKey: vacancyKeys.list(normalizedParams),
    queryFn: () => fetchVacancies(normalizedParams),
    ...options,
  });
};

export const useVacancyByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Vacancy>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<Vacancy>, Error>({
    queryKey: vacancyKeys.detail(id),
    queryFn: () => fetchVacancyById(id),
    enabled: Boolean(id),
    ...options,
  });
};

export const useVacancyBySlugQuery = (
  slug: string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Vacancy>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<Vacancy>, Error>({
    queryKey: vacancyKeys.slug(slug),
    queryFn: () => fetchVacancyBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
};

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Vacancy>, Error, CreateVacancyInput>,
  "mutationFn"
>;

export const useCreateVacancyMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Vacancy>, Error, CreateVacancyInput>({
    mutationFn: createVacancy,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateVacancyInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Vacancy>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateVacancyMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Vacancy>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateVacancy(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteVacancyResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteVacancyMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteVacancyResponse, Error, number | string>({
    mutationFn: deleteVacancy,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

export const useVacancyApplicationsQuery = (
  vacancyId: number | string,
  params?: Partial<VacancyApplicationsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<VacancyApplication[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeVacancyApplicationsListParams(params ?? {});

  return useQuery<ApiSuccessResponse<VacancyApplication[]>, Error>({
    queryKey: vacancyKeys.applications(vacancyId, normalizedParams),
    queryFn: () => fetchVacancyApplications(vacancyId, normalizedParams),
    enabled: Boolean(vacancyId),
    ...options,
  });
};

export const useVacancyApplicationByIdQuery = (
  vacancyId: number | string,
  applicationId: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<VacancyApplication>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ApiSuccessResponse<VacancyApplication>, Error>({
    queryKey: vacancyKeys.applicationDetail(vacancyId, applicationId),
    queryFn: () => fetchVacancyApplicationById(vacancyId, applicationId),
    enabled: Boolean(vacancyId) && Boolean(applicationId),
    ...options,
  });
};

type UpdateApplicationVariables = {
  vacancyId: number | string;
  applicationId: number | string;
  payload: UpdateVacancyApplicationInput;
};

type UpdateApplicationMutationOptions = Omit<
  UseMutationOptions<
    ApiSuccessResponse<VacancyApplication>,
    Error,
    UpdateApplicationVariables
  >,
  "mutationFn"
>;

export const useUpdateVacancyApplicationMutation = (
  options?: UpdateApplicationMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ApiSuccessResponse<VacancyApplication>,
    Error,
    UpdateApplicationVariables
  >({
    mutationFn: ({ vacancyId, applicationId, payload }) =>
      updateVacancyApplication(vacancyId, applicationId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteApplicationVariables = {
  vacancyId: number | string;
  applicationId: number | string;
};

type DeleteApplicationMutationOptions = Omit<
  UseMutationOptions<
    DeleteVacancyApplicationResponse,
    Error,
    DeleteApplicationVariables
  >,
  "mutationFn"
>;

export const useDeleteVacancyApplicationMutation = (
  options?: DeleteApplicationMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    DeleteVacancyApplicationResponse,
    Error,
    DeleteApplicationVariables
  >({
    mutationFn: ({ vacancyId, applicationId }) =>
      deleteVacancyApplication(vacancyId, applicationId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
