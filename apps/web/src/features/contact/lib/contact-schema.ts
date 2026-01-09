import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-+()]+$/;

const fullNameSchema = z.string().trim().min(1, "Full name is required");
const contactSchema = z
  .string()
  .trim()
  .min(1, "Contact information is required")
  .refine((val) => emailRegex.test(val) || phoneRegex.test(val), {
    message: "Please provide a valid email or phone number",
  });
const messageSchema = z
  .string()
  .trim()
  .min(1, "Message is required")
  .min(10, "Message must be at least 10 characters");

export const contactFieldValidators = {
  fullName: (value: string) => {
    const result = fullNameSchema.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  },
  contact: (value: string) => {
    const result = contactSchema.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  },
  message: (value: string) => {
    const result = messageSchema.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  },
};

// ============================================================================
// Contact Form Schema (Client-side validation)
// ============================================================================

export const ContactFormSchema = z.object({
  fullName: fullNameSchema,
  contact: contactSchema,
  message: messageSchema,
  serviceId: z.number().int().positive().optional().nullable(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// ============================================================================
// Contact Response Schema (API response)
// ============================================================================

export const ContactResponseSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  contact: z.string(),
  message: z.string(),
  serviceId: z.number().nullable(),
  isHandled: z.boolean(),
  createdAt: z.string(),
});

export type ContactResponse = z.infer<typeof ContactResponseSchema>;

// ============================================================================
// API Response Wrapper
// ============================================================================

export const ContactApiResponseSchema = z.object({
  success: z.boolean(),
  data: ContactResponseSchema,
});

export type ContactApiResponse = z.infer<typeof ContactApiResponseSchema>;
