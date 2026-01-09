import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

const logoFileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number]),
    "Logo must be a supported image type",
  );

const basePartnerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  websiteUrl: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Website url is required"),
});

export const partnerSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  slug: z.string(),
  description: z.string().min(1, "Description is required"),
  websiteUrl: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Website url is required"),
  logoUrl: z.string().url("Must be a valid URL").min(1, "Logo url is required"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPartnerSchema = basePartnerFormSchema
  .extend({
    logo: logoFileSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.logo) {
      ctx.addIssue({
        code: "custom",
        message: "Logo is required",
        path: ["logo"],
      });
    }
  });

export const updatePartnerFormSchema = basePartnerFormSchema.extend({
  logo: logoFileSchema.optional(),
});

export const updatePartnerSchema = partnerSchema.partial();

export const partnersListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  onlyWithLogo: z.boolean().default(false),
});

export type Partner = z.infer<typeof partnerSchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerFormInput = z.infer<typeof updatePartnerFormSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type PartnerFormValues = z.infer<typeof basePartnerFormSchema>;
export type PartnerUpdatePayload = z.infer<typeof basePartnerFormSchema> & {
  slug?: string;
  logoUrl?: string;
  logo?: File;
};
export type PartnerListParams = z.infer<typeof partnersListParamsSchema>;

export const normalizePartnersListParams = (
  params: Partial<PartnerListParams> = {},
): PartnerListParams => {
  const parsed = partnersListParamsSchema.parse(params);
  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
