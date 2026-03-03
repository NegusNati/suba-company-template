import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import {
  fetchContacts,
  fetchContactById,
  updateContact,
  deleteContact,
  submitContactForm,
  type ContactDetailResponse,
  type DeleteContactResponse,
} from "./contact-api";
import {
  normalizeContactListParams,
  type ContactListParams,
  type CreateContact,
  type UpdateContact,
} from "./contact-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

/**
 * Query key factory for contacts
 * Provides consistent cache keys across the application
 */
export const contactKeys = {
  all: [AUTH_API_ENDPOINTS.CONTACT_US] as const,
  lists: () => [...contactKeys.all] as const,
  list: (params: ContactListParams) => [...contactKeys.all, params] as const,
  details: () => [...contactKeys.all] as const,
  detail: (id: number) => [`${AUTH_API_ENDPOINTS.CONTACT_US}/${id}`] as const,
};

/**
 * Fetch contacts with pagination and filtering (Admin only)
 */
export const useContactsQuery = (params: Partial<ContactListParams>) => {
  const normalizedParams = normalizeContactListParams(params);

  return useQuery({
    queryKey: contactKeys.list(normalizedParams),
    queryFn: () => fetchContacts(normalizedParams),
  });
};

/**
 * Fetch a single contact by ID (Admin only)
 */
export const useContactByIdQuery = (
  id: number,
  options?: Omit<
    UseQueryOptions<ContactDetailResponse>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => fetchContactById(id),
    ...options,
  });
};

/**
 * Update contact mutation options (Admin only - for isHandled status)
 */
type UpdateContactMutationOptions = Omit<
  UseMutationOptions<
    ContactDetailResponse,
    Error,
    { id: number; data: UpdateContact }
  >,
  "mutationFn"
>;

/**
 * Update a contact's handled status (Admin only)
 */
export const useUpdateContactMutation = (
  options?: UpdateContactMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<
    ContactDetailResponse,
    Error,
    { id: number; data: UpdateContact }
  >({
    mutationFn: ({ id, data }) => updateContact(id, data),
    onSuccess: (...args) => {
      // Invalidate list queries and specific detail query
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: contactKeys.detail(args[1].id),
      });
      onSuccess?.(...args);
    },
    ...(onError && { onError }),
    ...rest,
  });
};

/**
 * Delete contact mutation options (Admin only)
 */
type DeleteContactMutationOptions = Omit<
  UseMutationOptions<DeleteContactResponse, Error, number>,
  "mutationFn"
>;

/**
 * Delete a contact (Admin only)
 */
export const useDeleteContactMutation = (
  options?: DeleteContactMutationOptions,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteContactResponse, Error, number>({
    mutationFn: deleteContact,
    onSuccess: (...args) => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      // Remove the deleted item from cache
      queryClient.removeQueries({ queryKey: contactKeys.detail(args[1]) });
      onSuccess?.(...args);
    },
    ...(onError && { onError }),
    ...rest,
  });
};

/**
 * Submit contact form mutation options (Public - no auth)
 */
type SubmitContactMutationOptions = Omit<
  UseMutationOptions<ContactDetailResponse, Error, CreateContact>,
  "mutationFn"
>;

/**
 * Submit a contact form (Public - No authentication required)
 * Use this hook for public-facing contact forms
 */
export const useSubmitContactMutation = (
  options?: SubmitContactMutationOptions,
) => {
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ContactDetailResponse, Error, CreateContact>({
    mutationFn: submitContactForm,
    onSuccess: (...args) => {
      // No cache invalidation needed for public submissions
      // Admin dashboard will need to refresh to see new submissions
      onSuccess?.(...args);
    },
    ...(onError && { onError }),
    ...rest,
  });
};
