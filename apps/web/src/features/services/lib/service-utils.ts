import { API_BASE_URL } from "@/lib/api-base";

const SERVER_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Prepends the server base URL to relative image paths
 * @param imageUrl - The image URL (can be absolute or relative)
 * @returns Full image URL with server base URL if needed
 */
export const getServiceImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;

  // If already an absolute URL, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Prepend server URL for relative paths
  return `${SERVER_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};
