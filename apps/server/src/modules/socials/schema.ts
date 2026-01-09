import { z } from "zod";

export const socialResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  iconUrl: z.string().nullable(),
  baseUrl: z.string(),
});

export const publicSocialResponseSchema = socialResponseSchema;

export type SocialResponse = z.infer<typeof socialResponseSchema>;
export type PublicSocialResponse = z.infer<typeof publicSocialResponseSchema>;
