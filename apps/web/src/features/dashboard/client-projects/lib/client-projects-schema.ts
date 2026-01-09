import { IMAGE_MIME_TYPES } from "@suba-company-template/types";
import { z } from "zod";

import { partnerSchema } from "../../partners/lib/partners-schema";
import { serviceSchema } from "../../services/lib/services-schema";
import { tagSchema } from "../../tags/lib/tags-schema";

export const clientProjectsSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string(),
  excerpt: z.string().min(1, "Excerpt is required").max(255),
  overview: z.string().min(1, "overview is required").max(255),
  clientId: z.number().int().positive().min(1, "Partner id is required"),
  client: partnerSchema.optional(),
  projectScope: z.string().min(1, "Project scope is required"),
  impact: z.string().nullable(),
  problem: z.string().nullable(),
  process: z.string().nullable(),
  deliverable: z.string().nullable(),
  serviceId: z.number().int().positive().min(1, "Partner id is required"),
  service: serviceSchema.optional(),
  tags: z.array(tagSchema),
  images: z.array(
    z.object({
      id: z.number(),
      imageUrl: z.string(),
      position: z.number(),
      caption: z.string().optional().nullable(),
    }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createClientProjectSchema = clientProjectsSchema
  .omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
    tags: true,
    images: true,
    client: true,
    service: true,
  })
  .extend({
    tagIds: z.array(z.number().int().positive()).min(1, "Tags are required"),
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

export const updateClientProjectSchema = createClientProjectSchema.partial();

export type ClientProject = z.infer<typeof clientProjectsSchema>;
export type CreateClientProjectInput = z.infer<
  typeof createClientProjectSchema
>;
export type UpdateClientProjectInput = z.infer<
  typeof updateClientProjectSchema
>;
export type UpdateClientProject = UpdateClientProjectInput & {
  id?: number;
  existingImages?: ClientProject["images"];
};

export const clientProjectsListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  clientId: z.number().int().positive().optional(),
  serviceId: z.number().int().positive().optional(),
  tagId: z.number().int().positive().optional(),
});

export type ClientProjectsListParams = z.infer<
  typeof clientProjectsListParamsSchema
>;

export const normalizeClientProjectsListParams = (
  params: Partial<ClientProjectsListParams> = {},
): ClientProjectsListParams => {
  const parsed = clientProjectsListParamsSchema.parse(params);

  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
