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

export const partnerSortFields = ["createdAt", "title"] as const;
export type PartnerSortField = (typeof partnerSortFields)[number];
const partnerSortSchema = sortSchema.extend({
  sortBy: z.enum(partnerSortFields).optional(),
});

export const createPartnerSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  logoUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
});

// Schema for multipart form data (used in controller)
export const createPartnerFormSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  description: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  websiteUrl: z
    .string()
    .url()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  logo: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
});

export const updatePartnerSchema = buildUpdateSchema(createPartnerSchema);

export const updatePartnerFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    description: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    websiteUrl: z
      .string()
      .url()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    logo: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    logoUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const partnersQuerySchema = paginationSchema
  .merge(partnerSortSchema)
  .merge(searchSchema)
  .extend({
    onlyWithLogo: z.coerce.boolean().default(false),
  });

export const publicPartnersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  onlyWithLogo: z.coerce.boolean().default(true),
  sortBy: z.enum(partnerSortFields).default("title"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  cursor: z.string().optional(),
});

export const partnerIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type CreatePartnerFormInput = z.infer<typeof createPartnerFormSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type UpdatePartnerFormInput = z.infer<typeof updatePartnerFormSchema>;
export type PartnersQuery = z.infer<typeof partnersQuerySchema>;
export type PublicPartnersQuery = z.infer<typeof publicPartnersQuerySchema>;
export type PartnerIdParams = z.infer<typeof partnerIdParamSchema>;
