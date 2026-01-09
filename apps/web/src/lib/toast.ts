import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

export const toastApiError = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): void => {
  toast.error(getApiErrorMessage(error, fallback));
};
