import type { Contact, CreateContact, UpdateContact } from "./contact-schema";
import type { ContactListParams } from "./contact-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

/**
 * API response structure for paginated data
 */
interface PaginatedContactResponse {
  success: boolean;
  data: Contact[];
  meta: {
    timestamp: string;
    requestId: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API response for contact list
 */
export type ContactListResponse = PaginatedContactResponse;

/**
 * API response for contact detail
 */
export type ContactDetailResponse = {
  success: boolean;
  data: Contact;
};

/**
 * API response for delete contact
 */
export type DeleteContactResponse = {
  success: boolean;
  data: { message: string };
};

/**
 * Fetch contacts with pagination, search, and filtering (Admin only)
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of contacts
 */
export async function fetchContacts(
  params: ContactListParams,
): Promise<ContactListResponse> {
  const response = await apiClient.get<ContactListResponse>(
    AUTH_API_ENDPOINTS.CONTACT_US,
    { params },
  );
  return response.data;
}

/**
 * Fetch a single contact by ID (Admin only)
 * @param id - Contact ID
 * @returns Contact details
 */
export async function fetchContactById(
  id: number,
): Promise<ContactDetailResponse> {
  const response = await apiClient.get<ContactDetailResponse>(
    `${AUTH_API_ENDPOINTS.CONTACT_US}/${id}`,
  );
  return response.data;
}

/**
 * Update contact status (Admin only - only isHandled can be updated)
 * @param id - Contact ID
 * @param data - Update data (isHandled)
 * @returns Updated contact
 */
export async function updateContact(
  id: number,
  data: UpdateContact,
): Promise<ContactDetailResponse> {
  const response = await apiClient.patch<ContactDetailResponse>(
    `${AUTH_API_ENDPOINTS.CONTACT_US}/${id}`,
    data,
  );
  return response.data;
}

/**
 * Delete a contact (Admin only)
 * @param id - Contact ID
 * @returns Success confirmation
 */
export async function deleteContact(
  id: number,
): Promise<DeleteContactResponse> {
  const response = await apiClient.delete<DeleteContactResponse>(
    `${AUTH_API_ENDPOINTS.CONTACT_US}/${id}`,
  );
  return response.data;
}

/**
 * Submit a contact form (Public - No authentication required)
 * This endpoint is accessible to anyone and is used for public contact forms
 * @param data - Contact form data
 * @returns Created contact confirmation
 */
export async function submitContactForm(
  data: CreateContact,
): Promise<ContactDetailResponse> {
  // Use the public endpoint (no auth required)
  const response = await apiClient.post<ContactDetailResponse>(
    "/api/v1/contact", // Public endpoint
    data,
  );
  return response.data;
}
