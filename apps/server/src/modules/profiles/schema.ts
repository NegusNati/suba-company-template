import { z } from "zod";

export const socialResponseSchema = z.object({
  socialId: z.number(),
  handle: z.string().nullable(),
  fullUrl: z.string().nullable(),
  socialTitle: z.string(),
  socialIconUrl: z.string().nullable(),
  socialBaseUrl: z.string(),
});

export const profileResponseSchema = z.object({
  id: z.number(),
  userId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  headshotUrl: z.string().nullable(),
  role: z.enum(["admin", "blogger", "user"]),
  phoneNumber: z.string().nullable(),
  email: z.string().email(),
  userName: z.string(),
  userImage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  socials: z.array(socialResponseSchema),
});

export type SocialResponse = z.infer<typeof socialResponseSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
