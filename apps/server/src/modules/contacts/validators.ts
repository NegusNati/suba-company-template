import { z } from "zod";

import {
  paginationSchema,
  sortSchema,
  searchSchema,
  baseListQuerySchema,
} from "../../shared/query/parser";

export const contactSortFields = ["createdAt", "fullName"] as const;
export type ContactSortField = (typeof contactSortFields)[number];
const contactSortSchema = sortSchema.extend({
  sortBy: z.enum(contactSortFields).optional(),
});

export const createContactSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  contact: z.string().min(1, "Contact information is required"),
  message: z.string().min(1, "Message is required"),
  serviceId: z.number().int().positive().nullish(),
});

export const updateContactSchema = z.object({
  isHandled: z.boolean(),
});

export const contactsQuerySchema = paginationSchema
  .merge(contactSortSchema)
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(["createdAt", "fullName"]).optional(),
    isHandled: z.coerce.boolean().optional(),
    serviceId: z.coerce.number().int().positive().optional(),
  });

export const publicContactsQuerySchema = baseListQuerySchema
  .extend({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    serviceId: z.coerce.number().int().positive().optional(),
  })
  .extend({
    sortBy: z.enum(contactSortFields).optional(),
  });

export const contactIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactsQuery = z.infer<typeof contactsQuerySchema>;
export type PublicContactsQuery = z.infer<typeof publicContactsQuerySchema>;
export type ContactIdParams = z.infer<typeof contactIdParamSchema>;
