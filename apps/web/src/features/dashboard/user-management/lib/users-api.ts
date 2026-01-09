import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  User,
  UsersListParams,
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  RoleOption,
} from "./users-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type UserResponse = ApiSuccessResponse<User>;
export type UsersListResponse = ApiSuccessResponse<User[]>;
export type DeleteUserResponse = ApiSuccessResponse<{
  message: string;
}>;
export type RolesResponse = ApiSuccessResponse<RoleOption[]>;

type UserFormMultipartPayload = {
  name?: string;
  email?: string;
  password?: string;
  emailVerified?: boolean;
  role?: "admin" | "blogger" | "user";
  imageUrl?: string | null;
  image?: File | null;
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    headshotUrl?: string | null;
  };
  profileHeadshot?: File | null;
  socials?: Array<{
    socialId: number;
    handle?: string | null;
    fullUrl?: string | null;
  }>;
};

/**
 * Builds FormData object from user input for multipart/form-data uploads
 * Handles avatar and headshot file uploads along with user data
 * @param values - User form data including optional files
 * @returns FormData object ready for API submission
 */
const buildUserFormData = (values: UserFormMultipartPayload) => {
  const formData = new FormData();

  if (values.name !== undefined) {
    formData.append("name", values.name);
  }

  if (values.email !== undefined) {
    formData.append("email", values.email);
  }

  if (values.password !== undefined) {
    formData.append("password", values.password);
  }

  if (values.emailVerified !== undefined) {
    formData.append("emailVerified", String(values.emailVerified));
  }

  if (values.role !== undefined) {
    formData.append("role", values.role);
  }

  if (values.imageUrl !== undefined && values.imageUrl !== null) {
    formData.append("imageUrl", values.imageUrl);
  }

  // Handle avatar image file
  if (values.image !== undefined && values.image !== null) {
    formData.append("image", values.image);
  }

  // Handle profile object
  if (values.profile) {
    formData.append("profile", JSON.stringify(values.profile));
  }

  // Handle profile headshot file
  if (values.profileHeadshot !== undefined && values.profileHeadshot !== null) {
    formData.append("profileHeadshot", values.profileHeadshot);
  }

  // Handle socials array
  if (values.socials !== undefined) {
    formData.append("socials", JSON.stringify(values.socials));
  }

  return formData;
};

/**
 * Fetches a paginated list of users with optional filtering and search
 * @param params - Query parameters including page, limit, search, role filter
 * @returns Promise containing users array and pagination metadata
 */
export const fetchUsers = async (params: UsersListParams) => {
  const { data } = await apiClient.get<UsersListResponse>(
    AUTH_API_ENDPOINTS.USERS,
    { params },
  );

  return data;
};

/**
 * Fetches a single user by ID
 * @param id - User ID (UUID string)
 * @returns Promise containing user details
 */
export const fetchUserById = async (id: string) => {
  const { data } = await apiClient.get<UserResponse>(
    `${AUTH_API_ENDPOINTS.USERS}/${id}`,
  );

  return data;
};

/**
 * Creates a new user with optional avatar and headshot uploads
 * @param values - User creation data including credentials and profile
 * @returns Promise containing created user details
 */
export const createUser = async (values: CreateUserInput) => {
  const formData = buildUserFormData({
    name: values.name,
    email: values.email,
    password: values.password,
    emailVerified: values.emailVerified,
    role: values.role,
    imageUrl: values.imageUrl,
    image: values.image,
    profile: values.profile,
    profileHeadshot: values.profileHeadshot,
  });

  const { data } = await apiClient.post<UserResponse>(
    AUTH_API_ENDPOINTS.USERS,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

/**
 * Updates an existing user with optional avatar and headshot uploads
 * @param id - User ID (UUID string)
 * @param values - Partial user update data
 * @returns Promise containing updated user details
 */
export const updateUser = async (id: string, values: UpdateUserInput) => {
  const formData = buildUserFormData({
    name: values.name,
    email: values.email,
    emailVerified: values.emailVerified,
    role: values.role,
    imageUrl: values.imageUrl,
    image: values.image,
    profile: values.profile,
    profileHeadshot: values.profileHeadshot,
    socials: values.socials,
  });

  const { data } = await apiClient.patch<UserResponse>(
    `${AUTH_API_ENDPOINTS.USERS}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

/**
 * Deletes a user by ID
 * Requires authentication and ADMIN role
 * Cannot delete self or last ADMIN user
 * @param id - User ID (UUID string)
 * @returns Promise containing success message
 */
export const deleteUser = async (id: string) => {
  const { data } = await apiClient.delete<DeleteUserResponse>(
    `${AUTH_API_ENDPOINTS.USERS}/${id}`,
  );

  return data;
};

/**
 * Assigns a new role to a user
 * Validates role assignment rules (cannot demote self, cannot remove last admin)
 * @param id - User ID (UUID string)
 * @param roleData - New role assignment (admin, blogger, or user)
 * @returns Promise containing updated user details
 */
export const assignUserRole = async (id: string, roleData: AssignRoleInput) => {
  const { data } = await apiClient.patch<UserResponse>(
    `${AUTH_API_ENDPOINTS.USERS}/${id}/role`,
    roleData,
  );

  return data;
};

/**
 * Fetches available user roles
 * @returns Promise containing array of role options with labels
 */
export const fetchRoles = async () => {
  const { data } = await apiClient.get<RolesResponse>(
    `${AUTH_API_ENDPOINTS.USERS}/roles`,
  );

  return data;
};
