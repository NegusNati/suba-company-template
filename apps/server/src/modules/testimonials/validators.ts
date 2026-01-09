import { z } from "zod";

import { baseListQuerySchema } from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const testimonialSortFields = ["createdAt", "companyName"] as const;
export type TestimonialSortField = (typeof testimonialSortFields)[number];

export const createTestimonialSchema = z.object({
  comment: z.string().min(1),
  companyName: z.string().min(1).max(255),
  companyLogoUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .optional()
    .or(z.literal("")),
  spokePersonName: z.string().max(255).optional(),
  spokePersonTitle: z.string().max(255).optional(),
  spokePersonHeadshotUrl: z
    .string()
    .refine(urlRefine, urlErrorMessage)
    .optional()
    .or(z.literal("")),
  partnerId: z.number().int().positive().optional(),
});

// Schema for multipart form data (used in controller)
export const createTestimonialFormSchema = z.object({
  comment: z.string().min(1),
  companyName: z.string().min(1).max(255),
  spokePersonName: z
    .string()
    .max(255)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  spokePersonTitle: z
    .string()
    .max(255)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  partnerId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine(
      (val) => val === undefined || (Number.isInteger(val) && val > 0),
      "Must be positive integer",
    )
    .optional(),
  companyLogo: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
  spokePersonHeadshot: z
    .instanceof(File)
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .optional(),
});

export const updateTestimonialSchema = buildUpdateSchema(
  createTestimonialSchema,
);

export const updateTestimonialFormSchema = z
  .object({
    comment: z
      .string()
      .min(1)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    companyName: z
      .string()
      .min(1)
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    spokePersonName: z
      .string()
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    spokePersonTitle: z
      .string()
      .max(255)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    partnerId: z
      .string()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val > 0),
        "Must be positive integer",
      )
      .optional(),
    companyLogo: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    spokePersonHeadshot: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    companyLogoUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    spokePersonHeadshotUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const testimonialQuerySchema = baseListQuerySchema
  .extend({
    partnerId: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(testimonialSortFields).optional(),
  })
  .strict();

export const publicTestimonialQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(12).default(6),
  search: z.string().optional(),
  partnerId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(testimonialSortFields).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().optional(),
});

export const testimonialIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type CreateTestimonialFormInput = z.infer<
  typeof createTestimonialFormSchema
>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type UpdateTestimonialFormInput = z.infer<
  typeof updateTestimonialFormSchema
>;
export type TestimonialQuery = z.infer<typeof testimonialQuerySchema>;
export type PublicTestimonialQuery = z.infer<
  typeof publicTestimonialQuerySchema
>;
export type TestimonialIdParams = z.infer<typeof testimonialIdParamSchema>;
