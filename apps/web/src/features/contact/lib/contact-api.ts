import { ContactFormSchema } from "./contact-schema";
import type { ContactApiResponse, ContactFormData } from "./contact-schema";

import apiClient from "@/lib/axios";

/**
 * Submit a contact form (Public - No authentication required)
 * This endpoint is accessible to anyone and is used for public contact forms
 * @param data - Contact form data
 * @returns Created contact confirmation
 */
export async function submitContactForm(
  data: ContactFormData,
): Promise<ContactApiResponse> {
  const parsed = ContactFormSchema.safeParse(data);
  if (!parsed.success) {
    const messages = Array.from(
      new Set(parsed.error.issues.map((issue) => issue.message)),
    );
    throw new Error(messages.join(". "));
  }
  const response = await apiClient.post<ContactApiResponse>(
    "/api/v1/contacts/client",
    parsed.data,
  );
  return response.data;
}
