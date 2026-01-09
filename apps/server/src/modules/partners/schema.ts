import { z } from "zod";

export const partnerResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  logoUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicPartnerResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
});

export type PartnerResponse = z.infer<typeof partnerResponseSchema>;
export type PublicPartnerResponse = z.infer<typeof publicPartnerResponseSchema>;
