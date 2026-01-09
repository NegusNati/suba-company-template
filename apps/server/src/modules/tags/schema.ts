import { z } from "zod";

export const tagResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
});

export const publicTagResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type TagResponse = z.infer<typeof tagResponseSchema>;
export type PublicTagResponse = z.infer<typeof publicTagResponseSchema>;
