import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

const managerIdFormField = z
  .string()
  .nullable()
  .transform((val) => {
    if (val === null || val === undefined || val === "" || val === "null") {
      return null;
    }
    const parsed = Number.parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  .refine(
    (val) =>
      val === null || val === undefined || (Number.isInteger(val) && val > 0),
    "Manager ID must be a positive integer",
  )
  .optional();

// Image field matching gallery pattern
const imageFormField = z
  .instanceof(File)
  .nullable()
  .transform((val) => (val === null ? undefined : val))
  .optional();

export const orgSortFields = ["createdAt", "lastName", "title"] as const;
export type OrgSortField = (typeof orgSortFields)[number];
const orgSortSchema = sortSchema.extend({
  sortBy: z.enum(orgSortFields).optional(),
});

export const createOrgMemberSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  managerId: z.coerce.number().int().positive().nullable().optional(),
  headshotUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .optional()
    .nullable(),
});

export const createOrgMemberFormSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  managerId: managerIdFormField,
  image: imageFormField,
});

export const updateOrgMemberSchema = buildUpdateSchema(createOrgMemberSchema);

export const updateOrgMemberFormSchema = z
  .object({
    firstName: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    lastName: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    title: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    managerId: managerIdFormField,
    image: imageFormField,
    imageUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
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

export const orgQuerySchema = paginationSchema
  .merge(orgSortSchema)
  .merge(searchSchema)
  .extend({
    managerId: z.coerce.number().int().positive().optional(),
    rootOnly: z.coerce.boolean().optional(),
  });

export const publicOrgQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().optional(),
  sortBy: z.enum(orgSortFields).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const orgMemberIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateOrgMemberInput = z.infer<typeof createOrgMemberSchema>;
export type UpdateOrgMemberInput = z.infer<typeof updateOrgMemberSchema>;
export type OrgQuery = z.infer<typeof orgQuerySchema>;
export type PublicOrgQuery = z.infer<typeof publicOrgQuerySchema>;
export type OrgMemberIdParams = z.infer<typeof orgMemberIdParamSchema>;
export type CreateOrgMemberFormInput = z.infer<
  typeof createOrgMemberFormSchema
>;
export type UpdateOrgMemberFormInput = z.infer<
  typeof updateOrgMemberFormSchema
>;
