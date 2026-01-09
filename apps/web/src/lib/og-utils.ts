/**
 * OG Image URL utilities for dynamic Open Graph images
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * OG Image API endpoints
 */
export const OG_ENDPOINTS = {
  BLOG: "/api/og/blog",
  SERVICE: "/api/og/service",
  PROJECT: "/api/og/project",
  CAREER: "/api/og/career",
  PAGE: "/api/og/page",
  DEFAULT: "/api/og/default",
} as const;

export type OgImageType = "blog" | "service" | "project" | "career" | "page";

/**
 * Build OG image URL for a blog post
 */
export function getBlogOgImageUrl(slug: string): string {
  return `${API_BASE_URL}${OG_ENDPOINTS.BLOG}/${encodeURIComponent(slug)}`;
}

/**
 * Build OG image URL for a service
 */
export function getServiceOgImageUrl(slug: string): string {
  return `${API_BASE_URL}${OG_ENDPOINTS.SERVICE}/${encodeURIComponent(slug)}`;
}

/**
 * Build OG image URL for a project/case study
 */
export function getProjectOgImageUrl(slug: string): string {
  return `${API_BASE_URL}${OG_ENDPOINTS.PROJECT}/${encodeURIComponent(slug)}`;
}

/**
 * Build OG image URL for a career/vacancy
 */
export function getCareerOgImageUrl(slug: string): string {
  return `${API_BASE_URL}${OG_ENDPOINTS.CAREER}/${encodeURIComponent(slug)}`;
}

interface PageOgImageParams {
  title: string;
  description?: string;
  category?: string;
  image?: string;
}

/**
 * Build OG image URL for a generic page
 */
export function getPageOgImageUrl(params: PageOgImageParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("title", params.title);

  if (params.description) {
    searchParams.set("description", params.description);
  }
  if (params.category) {
    searchParams.set("category", params.category);
  }
  if (params.image) {
    searchParams.set("image", params.image);
  }

  return `${API_BASE_URL}${OG_ENDPOINTS.PAGE}?${searchParams.toString()}`;
}

/**
 * Get default OG image URL
 */
export function getDefaultOgImageUrl(): string {
  return `${API_BASE_URL}${OG_ENDPOINTS.DEFAULT}`;
}

/**
 * Get OG image URL by type
 */
export function getOgImageUrl(
  type: OgImageType,
  slugOrParams: string | PageOgImageParams,
): string {
  switch (type) {
    case "blog":
      return getBlogOgImageUrl(slugOrParams as string);
    case "service":
      return getServiceOgImageUrl(slugOrParams as string);
    case "project":
      return getProjectOgImageUrl(slugOrParams as string);
    case "career":
      return getCareerOgImageUrl(slugOrParams as string);
    case "page":
      return getPageOgImageUrl(slugOrParams as PageOgImageParams);
    default:
      return getDefaultOgImageUrl();
  }
}

/**
 * Site metadata for OG tags
 * These values are imported from the central template config
 */
import { SITE } from "@/config/template";

export const SITE_METADATA = {
  siteName: SITE.name,
  siteUrl: SITE.url,
  defaultTitle: SITE.defaultTitle,
  defaultDescription: SITE.defaultDescription,
  twitterHandle: `@${SITE.twitterHandle}`,
} as const;

/**
 * Helper to generate complete OG meta tag values
 */
export interface OgMetaTags {
  title: string;
  description: string;
  ogImage: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
}

export function generateOgMeta(
  options: Partial<OgMetaTags> & { ogImage?: string },
): OgMetaTags {
  return {
    title: options.title || SITE_METADATA.defaultTitle,
    description: options.description || SITE_METADATA.defaultDescription,
    ogImage: options.ogImage || getDefaultOgImageUrl(),
    ogType: options.ogType || "website",
    ogUrl: options.ogUrl,
    twitterCard: options.twitterCard || "summary_large_image",
  };
}
