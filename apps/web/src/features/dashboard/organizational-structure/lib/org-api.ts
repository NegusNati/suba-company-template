import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  OrgMember,
  OrgMembersListParams,
  CreateOrgMemberInput,
  UpdateOrgMemberInput,
} from "./org-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type OrgMemberResponse = ApiSuccessResponse<OrgMember>;
export type OrgMembersListResponse = ApiSuccessResponse<OrgMember[]>;
export type DeleteOrgMemberResponse = ApiSuccessResponse<{ message: string }>;

/**
 * Helper function to build FormData for org member submission
 * Matches gallery pattern for image handling
 */
const buildOrgMemberFormData = (
  values: Partial<CreateOrgMemberInput & UpdateOrgMemberInput>,
) => {
  const formData = new FormData();

  // Add text fields
  if (values.firstName !== undefined) {
    formData.append("firstName", values.firstName);
  }
  if (values.lastName !== undefined) {
    formData.append("lastName", values.lastName);
  }
  if (values.title !== undefined) {
    formData.append("title", values.title);
  }
  if (values.managerId !== undefined) {
    if (values.managerId === null) {
      formData.append("managerId", "null");
    } else if (Number.isFinite(values.managerId)) {
      formData.append("managerId", String(values.managerId));
    }
  }

  // Add image file if provided and is a valid File instance
  if (values.image instanceof File) {
    formData.append("image", values.image);
  }

  // Add imageUrl if provided (for updates without new file upload)
  if ("imageUrl" in values && values.imageUrl) {
    formData.append("imageUrl", values.imageUrl);
  }

  return formData;
};

/**
 * Fetch paginated list of org members
 */
export const fetchOrgMembers = async (params: OrgMembersListParams) => {
  const { data } = await apiClient.get<OrgMembersListResponse>(
    AUTH_API_ENDPOINTS.ORG_MEMBERS,
    { params },
  );

  return data;
};

/**
 * Fetch single org member by ID
 */
export const fetchOrgMemberById = async (id: number | string) => {
  const { data } = await apiClient.get<OrgMemberResponse>(
    `${AUTH_API_ENDPOINTS.ORG_MEMBERS}/${id}`,
  );

  return data;
};

/**
 * Create new org member
 */
export const createOrgMember = async (values: CreateOrgMemberInput) => {
  const formData = buildOrgMemberFormData(values);
  const { data } = await apiClient.post<OrgMemberResponse>(
    AUTH_API_ENDPOINTS.ORG_MEMBERS,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

/**
 * Update existing org member
 */
export const updateOrgMember = async (
  id: number | string,
  values: UpdateOrgMemberInput,
) => {
  const formData = buildOrgMemberFormData(values);
  const { data } = await apiClient.patch<OrgMemberResponse>(
    `${AUTH_API_ENDPOINTS.ORG_MEMBERS}/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

/**
 * Delete org member
 */
export const deleteOrgMember = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteOrgMemberResponse>(
    `${AUTH_API_ENDPOINTS.ORG_MEMBERS}/${id}`,
  );

  return data;
};
