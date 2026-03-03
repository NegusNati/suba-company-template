import { z } from "zod";

import {
  paginationSchema,
  searchSchema,
  sortSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const businessSectorSortFields = [
  "createdAt",
  "title",
  "updatedAt",
  "publishDate",
] as const;
export type BusinessSectorSortField = (typeof businessSectorSortFields)[number];
const publicBusinessSectorSortFields = [
  "publishDate",
  "title",
  "createdAt",
] as const;

const businessSectorSortSchema = sortSchema.extend({
  sortBy: z.enum(businessSectorSortFields).optional(),
});

export const businessSectorStatSchema = z.object({
  statKey: z.string().min(1).max(120),
  statValue: z.string().min(1).max(120),
  position: z.number().int().min(0).default(0),
});

export const businessSectorServiceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  position: z.number().int().min(0).default(0),
});

export const businessSectorGalleryImageSchema = z.object({
  imageUrl: z.string().refine(urlRefine, urlErrorMessage),
  position: z.number().int().min(0).default(0),
});

export const createBusinessSectorSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .optional(),
  excerpt: z.string().optional(),
  history: z.string().min(1),
  featuredImageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email().optional(),
  address: z.string().optional(),
  facebookUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  instagramUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  linkedinUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  publishDate: z.string().datetime().optional().nullable(),
  stats: z.array(businessSectorStatSchema).optional(),
  services: z.array(businessSectorServiceSchema).optional(),
  gallery: z.array(businessSectorGalleryImageSchema).optional(),
});

const parseJsonValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const businessSectorServiceMetaSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  position: z.number().int().min(0).optional(),
});

const businessSectorGalleryMetaSchema = z.object({
  imageUrl: z.string().refine(urlRefine, urlErrorMessage).optional(),
  position: z.number().int().min(0).optional(),
});

export const createBusinessSectorFormSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase with hyphens")
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  excerpt: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  history: z.string().min(1),
  featuredImageUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  phoneNumber: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  emailAddress: z
    .string()
    .email()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  address: z
    .string()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  facebookUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  instagramUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  linkedinUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  publishDate: z
    .string()
    .datetime()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  stats: z
    .preprocess(parseJsonValue, z.array(businessSectorStatSchema).optional())
    .optional(),
  servicesMeta: z
    .preprocess(
      parseJsonValue,
      z.array(businessSectorServiceMetaSchema).optional(),
    )
    .optional(),
  galleryMeta: z
    .preprocess(
      parseJsonValue,
      z.array(businessSectorGalleryMetaSchema).optional(),
    )
    .optional(),
});

export const updateBusinessSectorSchema = buildUpdateSchema(
  createBusinessSectorSchema,
  ["slug"],
);

const hasDefinedField = (data: Record<string, unknown>) =>
  Object.values(data).some((value) => value !== undefined);

export const updateBusinessSectorFormSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(500)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    excerpt: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    history: z
      .string()
      .min(1)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    featuredImageUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    phoneNumber: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    emailAddress: z
      .string()
      .email()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    address: z
      .string()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    facebookUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    instagramUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    linkedinUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    publishDate: z
      .string()
      .datetime()
      .nullable()
      .transform((val) => (val === null ? null : val))
      .optional(),
    stats: z
      .preprocess(parseJsonValue, z.array(businessSectorStatSchema).optional())
      .optional(),
    servicesMeta: z
      .preprocess(
        parseJsonValue,
        z.array(businessSectorServiceMetaSchema).optional(),
      )
      .optional(),
    galleryMeta: z
      .preprocess(
        parseJsonValue,
        z.array(businessSectorGalleryMetaSchema).optional(),
      )
      .optional(),
  })
  .refine((data) => hasDefinedField(data), {
    message: "At least one field must be provided for update",
  });

export const businessSectorQuerySchema = paginationSchema
  .merge(businessSectorSortSchema)
  .merge(searchSchema)
  .extend({});

export const publicBusinessSectorQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(publicBusinessSectorSortFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  });

export const businessSectorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type BusinessSectorStatInput = z.infer<typeof businessSectorStatSchema>;
export type BusinessSectorServiceInput = z.infer<
  typeof businessSectorServiceSchema
>;
export type BusinessSectorGalleryImageInput = z.infer<
  typeof businessSectorGalleryImageSchema
>;
export type CreateBusinessSectorInput = z.infer<
  typeof createBusinessSectorSchema
>;
export type CreateBusinessSectorFormInput = z.infer<
  typeof createBusinessSectorFormSchema
>;
export type UpdateBusinessSectorInput = z.infer<
  typeof updateBusinessSectorSchema
>;
export type UpdateBusinessSectorFormInput = z.infer<
  typeof updateBusinessSectorFormSchema
>;
export type BusinessSectorQuery = z.infer<typeof businessSectorQuerySchema>;
export type PublicBusinessSectorQuery = z.infer<
  typeof publicBusinessSectorQuerySchema
>;
export type BusinessSectorIdParams = z.infer<
  typeof businessSectorIdParamSchema
>;
