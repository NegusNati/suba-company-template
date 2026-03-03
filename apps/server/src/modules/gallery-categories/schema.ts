import { z } from "zod";

export const galleryCategoryDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  isSystem: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicGalleryCategoryDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  itemCount: z.number().int().nonnegative(),
});

export type GalleryCategoryDTO = z.infer<typeof galleryCategoryDtoSchema>;
export type PublicGalleryCategoryDTO = z.infer<
  typeof publicGalleryCategoryDtoSchema
>;
