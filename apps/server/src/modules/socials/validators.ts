import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

export const socialSortFields = ["title", "id"] as const;
export type SocialSortField = (typeof socialSortFields)[number];
const socialSortSchema = sortSchema.extend({
  sortBy: z.enum(socialSortFields).optional(),
});

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const createSocialSchema = z.object({
  title: z.string().min(1).max(100),
  iconUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  baseUrl: z.string().url(),
});

// Schema for multipart form data (used in controller)
export const createSocialFormSchema = z.object({
  title: z.string().min(1).max(100),
  baseUrl: z.string().url(),
  icon: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
});

export const updateSocialSchema = buildUpdateSchema(createSocialSchema);

export const updateSocialFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(100)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    baseUrl: z
      .string()
      .url()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    icon: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    iconUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const socialQuerySchema = paginationSchema
  .merge(socialSortSchema)
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(["id", "title"]).optional(),
  });

export const publicSocialQuerySchema = paginationSchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const socialIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateSocialInput = z.infer<typeof createSocialSchema>;
export type CreateSocialFormInput = z.infer<typeof createSocialFormSchema>;
export type UpdateSocialInput = z.infer<typeof updateSocialSchema>;
export type UpdateSocialFormInput = z.infer<typeof updateSocialFormSchema>;
export type SocialQuery = z.infer<typeof socialQuerySchema>;
export type PublicSocialQuery = z.infer<typeof publicSocialQuerySchema>;
export type SocialIdParams = z.infer<typeof socialIdParamSchema>;
