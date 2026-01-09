import { z } from "zod";

import { API_BASE_URL } from "@/lib/api-base";

// ============================================================================
// Client Partner Schema (Public API response)
// ============================================================================

const SERVER_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Build full image URL for relative paths from the API
 */
export function getPartnerLogoUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
}

export const ClientPartnerSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  websiteUrl: z.string().url().nullable(),
});

export type ClientPartner = z.infer<typeof ClientPartnerSchema>;

// ============================================================================
// API Response Schema
// ============================================================================

export const ClientPartnersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ClientPartnerSchema),
});

export type ClientPartnersResponse = z.infer<
  typeof ClientPartnersResponseSchema
>;
