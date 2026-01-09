import { API_BASE_URL } from "@/lib/api-base";
/**
 * Blog Utility Functions
 * Centralized helpers for consistent formatting across blog components
 */

const SERVER_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Build full image URL for relative paths from the API
 */
export function getBlogImageUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
}

/**
 * Format blog publish date for display
 */
export function formatBlogDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format read time for display
 */
export function formatReadTime(minutes: number | null | undefined): string {
  if (!minutes) return "";
  return `${minutes} min read`;
}

/**
 * Generate author handle from name
 */
export function getAuthorHandle(name: string): string {
  return `@${name.replace(/\s+/g, "").toLowerCase()}`;
}

/**
 * Get author avatar URL with fallback
 */
export function getAuthorAvatarUrl(
  image: string | null | undefined,
  name: string,
): string {
  if (image) {
    return image.startsWith("http") ? image : `${SERVER_URL}${image}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}
