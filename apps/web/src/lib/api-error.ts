import type {
  ApiErrorResponse,
  ValidationErrorDetail,
} from "@suba-company-template/types/api";
import { isAxiosError } from "axios";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const formatValidationDetails = (
  details: ValidationErrorDetail[] | undefined,
): string | undefined => {
  if (!Array.isArray(details) || details.length === 0) {
    return undefined;
  }

  const messages = details
    .map((detail) => {
      if (!detail?.message) {
        return undefined;
      }
      if (detail.field && detail.field !== "root") {
        return `${detail.field}: ${detail.message}`;
      }
      return detail.message;
    })
    .filter(Boolean) as string[];

  if (messages.length === 0) {
    return undefined;
  }

  return messages.slice(0, 3).join("\n");
};

const getMessageFromPayload = (payload: unknown): string | undefined => {
  if (!payload) {
    return undefined;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (isRecord(payload) && payload.success === false) {
    const apiError = payload as unknown as ApiErrorResponse;
    const detailMessage = formatValidationDetails(apiError.error?.details);
    return detailMessage ?? apiError.error?.message;
  }

  if (isRecord(payload)) {
    const errorValue = payload.error;
    if (isRecord(errorValue)) {
      const detailMessage = formatValidationDetails(
        errorValue.details as ValidationErrorDetail[] | undefined,
      );
      if (detailMessage) {
        return detailMessage;
      }
      if (typeof errorValue.message === "string") {
        return errorValue.message;
      }
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  }

  return undefined;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (isAxiosError(error)) {
    const message = getMessageFromPayload(error.response?.data);
    return message ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const normalizeAxiosErrorMessage = (error: unknown): void => {
  if (!isAxiosError(error)) {
    return;
  }

  const message = getMessageFromPayload(error.response?.data);
  if (message && message !== error.message) {
    error.message = message;
  }
};
