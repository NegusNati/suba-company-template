import { z } from "zod";

export const contactResponseSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  contact: z.string(),
  message: z.string(),
  serviceId: z.number().nullable(),
  isHandled: z.boolean(),
  createdAt: z.string(),
});

export const publicContactResponseSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

export type ContactResponse = z.infer<typeof contactResponseSchema>;
export type PublicContactResponse = z.infer<typeof publicContactResponseSchema>;
