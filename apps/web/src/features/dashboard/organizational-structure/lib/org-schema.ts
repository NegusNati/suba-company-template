import { z } from "zod";

// Image file validation schema matching gallery pattern
const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "File size must be less than 10MB",
  )
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type,
      ),
    "File must be a JPEG, PNG, GIF, or WebP image",
  );

// Base schema for org member
export const orgMemberSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string(),
  lastName: z.string(),
  title: z.string(),
  headshotUrl: z.string().nullable(),
  managerId: z.number().int().positive().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const baseOrgMemberFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(255, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(255, "Last name is too long"),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  managerId: z.number().int().positive().optional().nullable(),
});

// Create input schema
export const createOrgMemberSchema = baseOrgMemberFormSchema.extend({
  image: imageFileSchema.optional(),
});

// Update input schema (all fields optional)
export const updateOrgMemberSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(255, "First name is too long")
      .optional(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(255, "Last name is too long")
      .optional(),
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title is too long")
      .optional(),
    managerId: z.number().int().positive().optional().nullable(),
    image: imageFileSchema.optional(),
    imageUrl: z.string().optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.title !== undefined ||
      data.managerId !== undefined ||
      data.image !== undefined ||
      data.imageUrl !== undefined,
    {
      message: "At least one field must be provided for update",
    },
  );

// List params schema
export const orgMembersListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "lastName", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  managerId: z.number().int().positive().optional(),
  rootOnly: z.boolean().optional(),
});

// TypeScript types
export type OrgMember = z.infer<typeof orgMemberSchema>;
export type CreateOrgMemberInput = z.infer<typeof createOrgMemberSchema>;
export type UpdateOrgMemberInput = z.infer<typeof updateOrgMemberSchema>;
export type OrgMembersListParams = z.infer<typeof orgMembersListParamsSchema>;

// Normalize function to prevent cache refetch loops
export const normalizeOrgMembersListParams = (
  params: Partial<OrgMembersListParams> = {},
): OrgMembersListParams => {
  const parsed = orgMembersListParamsSchema.parse(params);

  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
