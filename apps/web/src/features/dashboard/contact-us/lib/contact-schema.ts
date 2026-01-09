import { z } from "zod";

export const contactSchema = z.object({
  id: z.number(),
  fullName: z.string().min(1),
  contact: z.string().min(1),
  message: z.string().min(1),
  serviceId: z.number().nullable(),
  isHandled: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createContactSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  contact: z.string().min(1, "Contact info is required"),
  message: z.string().min(1, "Message is required"),
  serviceId: z.number().nullable().optional(),
});

export const updateContactSchema = createContactSchema
  .partial()
  .extend({
    isHandled: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type Contact = z.infer<typeof contactSchema>;
export type CreateContact = z.infer<typeof createContactSchema>;
export type UpdateContact = z.infer<typeof updateContactSchema>;

export const contactListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isHandled: z.boolean().optional(),
});

export type ContactListParams = z.infer<typeof contactListParamsSchema>;

export const normalizeContactListParams = (
  params: Partial<ContactListParams>,
): ContactListParams => {
  const parsed = contactListParamsSchema.parse(params);
  return {
    ...parsed,
    search: parsed.search?.trim() || undefined,
  };
};
