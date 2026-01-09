import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { submitContactForm } from "./contact-api";
import type { ContactApiResponse, ContactFormData } from "./contact-schema";

// ============================================================================
// Mutation Options Type
// ============================================================================

type SubmitContactMutationOptions = Omit<
  UseMutationOptions<ContactApiResponse, Error, ContactFormData>,
  "mutationFn"
>;

// ============================================================================
// Submit Contact Mutation Hook
// ============================================================================

/**
 * Submit a contact form (Public - No authentication required)
 * Automatically shows toast notifications on success/error
 */
export const useSubmitContactMutation = (
  options?: SubmitContactMutationOptions,
) => {
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ContactApiResponse, Error, ContactFormData>({
    mutationFn: submitContactForm,
    onSuccess: (...args) => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      onSuccess?.(...args);
    },
    onError: (error, ...restArgs) => {
      toast.error(error.message || "Failed to send message. Please try again.");
      onError?.(error, ...restArgs);
    },
    ...rest,
  });
};
