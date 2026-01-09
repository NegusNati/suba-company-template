import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { MAX_IMAGE_SIZE_BYTES } from "@/lib/forms";
import { createListParamsSchema, normalizeListParams } from "@/lib/list-params";

export const socialSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  iconUrl: z.string(),
  baseUrl: z.string().url("Invalid URL format"),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const iconFileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number]),
    "Icon must be a supported image type",
  )
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE_BYTES,
    "Icon must be 10MB or smaller",
  );

export const createSocialSchema = socialSchema
  .omit({
    id: true,
    iconUrl: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    icon: iconFileSchema,
  });

export const updateSocialSchema = createSocialSchema.partial();

export type Social = z.infer<typeof socialSchema>;
export type CreateSocial = z.infer<typeof createSocialSchema>;
export type UpdateSocial = z.infer<typeof updateSocialSchema>;

export const socialsListParamsSchema = createListParamsSchema({
  sortBy: ["id", "title"] as const,
  defaultSortBy: "id",
});

export type SocialsListParams = z.infer<typeof socialsListParamsSchema>;
export const normalizeSocialsListParams = normalizeListParams(
  socialsListParamsSchema,
);
