import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  headshotUrl: z
    .string()
    .refine(
      (val) => val.startsWith("/") || z.string().url().safeParse(val).success,
      "Must be a valid URL or path starting with /",
    )
    .optional()
    .nullable(),
  phoneNumber: z
    .string()
    .regex(/^[+0-9\-\s]+$/, "Invalid phone number format")
    .optional(),
});

// Schema for updating a user's social link
export const userSocialInputSchema = z.object({
  socialId: z.number().int().positive(),
  handle: z.string().trim().optional().nullable(),
  fullUrl: z.string().url().optional().nullable(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  emailVerified: z.boolean().default(false),
  image: z
    .string()
    .refine(
      (val) => val.startsWith("/") || z.string().url().safeParse(val).success,
      "Must be a valid URL or path starting with /",
    )
    .optional()
    .nullable(),
  role: z.enum(["admin", "blogger", "user"]).default("user"),
  profile: profileSchema.default({}),
});

export const updateUserSchema = buildUpdateSchema(
  createUserSchema.pick({ name: true, email: true }).extend({
    profile: profileSchema.optional(),
    emailVerified: z.boolean().optional(),
    role: z.enum(["admin", "blogger", "user"]).optional(),
    image: z
      .string()
      .refine(
        (val) => val.startsWith("/") || z.string().url().safeParse(val).success,
        "Must be a valid URL or path starting with /",
      )
      .optional()
      .nullable(),
    socials: z.array(userSocialInputSchema).optional(),
  }),
);

export const assignRoleSchema = z.object({
  role: z.enum(["admin", "blogger", "user"]),
});

export const userSortFields = [
  "createdAt",
  "updatedAt",
  "name",
  "email",
] as const;
export type UserSortField = (typeof userSortFields)[number];
const userSortSchema = sortSchema.extend({
  sortBy: z.enum(userSortFields).optional(),
});

export const userListQuerySchema = paginationSchema
  .merge(userSortSchema)
  .merge(searchSchema)
  .extend({
    role: z.enum(["admin", "blogger", "user"]).optional(),
    email: z.string().email().optional(),
    status: z.enum(["active", "invited"]).optional(),
    cursor: z.string().optional(),
  });

export const userIdParamSchema = z.object({
  userId: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserSocialInput = z.infer<typeof userSocialInputSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserIdParams = z.infer<typeof userIdParamSchema>;
