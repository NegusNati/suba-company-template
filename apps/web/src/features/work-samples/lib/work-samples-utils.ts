import { API_BASE_URL } from "@/lib/api-base";

const SERVER_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Resolves an image path to a full URL
 */
export function getWorkSampleImageUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
}

/**
 * Formats a date string for display
 */
export function formatWorkSampleDate(
  dateStr: string | null | undefined,
): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
