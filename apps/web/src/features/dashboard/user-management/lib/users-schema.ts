import { z } from "zod";

// Schema for user's social link (from userSocials junction table)
export const userSocialSchema = z.object({
  socialId: z.number(),
  handle: z.string().nullable(),
  fullUrl: z.string().nullable(),
  socialTitle: z.string(),
  socialIconUrl: z.string().nullable(),
  socialBaseUrl: z.string(),
});

// User profile schema
export const userProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  headshotUrl: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  socials: z.array(userSocialSchema).default([]),
});

// Main user schema (from backend response)
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  role: z.enum(["admin", "blogger", "user"]),
  image: z.string().nullable(),
  profile: userProfileSchema,
  sessions: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for updating user's social link (form input)
export const userSocialInputSchema = z.object({
  socialId: z.number().int().positive(),
  handle: z.string().optional().nullable(),
  fullUrl: z.string().url().optional().nullable(),
});

// Profile schema for form input
const profileInputSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  headshotUrl: z.string().url().optional().nullable(),
  phoneNumber: z
    .string()
    .regex(/^[+0-9\-\s]+$/, "Invalid phone number format")
    .optional(),
});

// Create user schema for form validation
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  emailVerified: z.boolean().default(false),
  role: z.enum(["admin", "blogger", "user"]).default("user"),
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type,
        ),
      "Avatar must be a supported image type (JPEG, PNG, GIF, WebP)",
    )
    .optional()
    .nullable(),
  imageUrl: z.string().url().optional().nullable(),
  profile: profileInputSchema.optional(),
  profileHeadshot: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type,
        ),
      "Headshot must be a supported image type (JPEG, PNG, GIF, WebP)",
    )
    .optional()
    .nullable(),
});

// Update user schema (partial with optional password)
export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    socials: z.array(userSocialInputSchema).optional(),
  });

// Assign role schema
export const assignRoleSchema = z.object({
  role: z.enum(["admin", "blogger", "user"]),
});

// Role option schema for select options
export const roleOptionSchema = z.object({
  value: z.enum(["admin", "blogger", "user"]),
  label: z.string(),
});

// Export types
export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserSocial = z.infer<typeof userSocialSchema>;
export type UserSocialInput = z.infer<typeof userSocialInputSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type CreateUserInput = CreateUser;
export type UpdateUserInput = UpdateUser & { id?: string };
export type AssignRole = z.infer<typeof assignRoleSchema>;
export type AssignRoleInput = AssignRole;
export type RoleOption = z.infer<typeof roleOptionSchema>;

// Users list params schema
export const usersListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "name", "email", "role"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  role: z.enum(["admin", "blogger", "user"]).optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "invited"]).optional(),
});

export type UsersListParams = z.infer<typeof usersListParamsSchema>;

// Normalize list params utility
export const normalizeUsersListParams = (
  params: Partial<UsersListParams> = {},
): UsersListParams => {
  const parsed = usersListParamsSchema.parse(params);

  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
