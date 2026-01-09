/**
 * Generate a URL-safe slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending a number suffix if needed
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
