import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

export const serviceImageSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  position: z.number(),
  caption: z.string().optional().nullable(),
});

export const serviceSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string(),
  excerpt: z.string().min(1, "Excerpt is required").max(255),
  description: z.string().min(1, "Description is required"),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(serviceImageSchema),
});

export const createServiceSchema = serviceSchema
  .omit({
    id: true,
    slug: true,
    images: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    imagesMeta: z
      .array(
        z.object({
          position: z.number(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    images: z.array(
      z
        .instanceof(File)
        .refine(
          (file) =>
            IMAGE_MIME_TYPES.includes(
              file.type as (typeof IMAGE_MIME_TYPES)[number],
            ),
          "Image must be a supported image type",
        ),
    ),
  });

export const updateServiceSchema = createServiceSchema.partial();

export type Service = z.infer<typeof serviceSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type UpdateService = UpdateServiceInput & {
  id?: number;
  existingImages?: Service["images"];
};

export const servicesListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ServiceListParams = z.infer<typeof servicesListParamsSchema>;

export const normalizeServicesListParams = (
  params: Partial<ServiceListParams> = {},
): ServiceListParams => {
  const parsed = servicesListParamsSchema.parse(params);
  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
