import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { partnerSchema } from "../../partners/lib/partners-schema";

// Schema for testimonial response from API
export const testimonialSchema = z.object({
  id: z.number(),
  comment: z.string(),
  companyName: z.string(),
  companyLogoUrl: z.string().nullable(),
  spokePersonName: z.string().nullable(),
  spokePersonTitle: z.string().nullable(),
  spokePersonHeadshotUrl: z.string().nullable(),
  partnerId: z.number().nullable(),
  partner: partnerSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for file uploads
const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number]),
    "Must be a supported image type (JPEG, PNG, GIF, WebP)",
  );

// Base form schema (text fields only)
const baseTestimonialFormSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
  companyName: z.string().min(1, "Company name is required").max(255),
  spokePersonName: z.string().max(255).optional(),
  spokePersonTitle: z.string().max(255).optional(),
  partnerId: z.number().int().positive().optional(),
});

// Create testimonial form schema (optional images)
export const createTestimonialFormSchema = baseTestimonialFormSchema.extend({
  companyLogo: imageFileSchema.optional(),
  spokePersonHeadshot: imageFileSchema.optional(),
});

// Update testimonial form schema (all fields optional)
export const updateTestimonialFormSchema = z
  .object({
    comment: z.string().min(1, "Comment is required").optional(),
    companyName: z.string().min(1).max(255).optional(),
    spokePersonName: z.string().max(255).optional(),
    spokePersonTitle: z.string().max(255).optional(),
    partnerId: z.number().int().positive().optional(),
    companyLogo: imageFileSchema.optional(),
    spokePersonHeadshot: imageFileSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// List params schema
export const testimonialsListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  partnerId: z.number().int().positive().optional(),
  sortBy: z.enum(["createdAt", "companyName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// TypeScript types
export type Testimonial = z.infer<typeof testimonialSchema>;
export type CreateTestimonialInput = z.infer<
  typeof createTestimonialFormSchema
>;
export type UpdateTestimonialInput = z.infer<
  typeof updateTestimonialFormSchema
>;
export type TestimonialsListParams = z.infer<
  typeof testimonialsListParamsSchema
>;

// Form values type (for TanStack Form)
export type TestimonialFormValues = {
  comment: string;
  companyName: string;
  spokePersonName: string;
  spokePersonTitle: string;
  partnerId: number | undefined;
  companyLogo: File | undefined;
  spokePersonHeadshot: File | undefined;
};

// Update payload type (for mutation)
export type TestimonialUpdatePayload = {
  comment?: string;
  companyName?: string;
  spokePersonName?: string;
  spokePersonTitle?: string;
  partnerId?: number;
  companyLogo?: File;
  spokePersonHeadshot?: File;
};

// Normalize list params
export const normalizeTestimonialsListParams = (
  params: Partial<TestimonialsListParams> = {},
): TestimonialsListParams => {
  const parsed = testimonialsListParamsSchema.parse(params);
  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
