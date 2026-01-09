import { useForm as useTanstackForm } from "@tanstack/react-form";
import type {
  FormAsyncValidateOrFn,
  FormOptions,
  FormValidateOrFn,
} from "@tanstack/react-form";
import type { QueryKey } from "@tanstack/react-query";

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Shared debounce used across list/search and async selects
export const DEFAULT_DEBOUNCE_MS = 500;

// Utility to build FormData from a payload with support for File | File[] values.
// Files are appended with the provided key; arrays append multiple entries using the same key.
export function buildMultipartFormData(
  payload: Record<string, unknown>,
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Handle File[]
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(key, item);
        } else if (item !== undefined && item !== null) {
          formData.append(key, String(item));
        }
      });
      return;
    }

    // Handle single File
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

// Helper used by prefetchers to accept either a query key array or a builder.
export function normalizeQueryKey(key: QueryKey | (() => QueryKey)): QueryKey {
  return typeof key === "function" ? key() : key;
}

type DashboardFormOptions<TFormData, TSubmitMeta = unknown> = FormOptions<
  TFormData,
  FormValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  TSubmitMeta
>;

export function useDashboardForm<TFormData, TSubmitMeta = unknown>(
  opts?: DashboardFormOptions<TFormData, TSubmitMeta>,
) {
  return useTanstackForm(opts);
}
