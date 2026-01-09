import { z } from "zod";

export const userListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  role: z.enum(["admin", "blogger", "user"]),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for user's social link (from userSocials junction table)
export const userSocialItemSchema = z.object({
  socialId: z.number(),
  handle: z.string().nullable(),
  fullUrl: z.string().nullable(),
  socialTitle: z.string(),
  socialIconUrl: z.string().nullable(),
  socialBaseUrl: z.string(),
});

export const userProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  headshotUrl: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  socials: z.array(userSocialItemSchema).default([]),
});

export const userDetailResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  role: z.enum(["admin", "blogger", "user"]),
  profile: userProfileSchema,
  image: z.string().nullable(),
  sessions: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const roleOptionSchema = z.object({
  value: z.enum(["admin", "blogger", "user"]),
  label: z.string(),
});

export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserSocialItem = z.infer<typeof userSocialItemSchema>;
export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;
export type RoleOption = z.infer<typeof roleOptionSchema>;
