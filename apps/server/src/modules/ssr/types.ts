/**
 * SSR Types - For social media crawler pre-rendering
 */

export interface PageMeta {
  title: string;
  description: string;
  ogImage: string;
  ogType: string;
  canonicalUrl: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface SsrConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  locale: string;
}

/**
 * SSR Configuration
 *
 * These values are used for server-side rendering of meta tags for social crawlers.
 * Update these to match your company branding.
 *
 * NOTE: For a fully centralized config, consider moving these to a shared package
 * or loading from environment variables.
 */
export const SSR_CONFIG: SsrConfig = {
  siteName: process.env.SITE_NAME || "Your Company",
  siteUrl: process.env.VITE_SITE_URL || "http://localhost:5173",
  defaultTitle:
    process.env.SITE_TITLE ||
    "Your Company | Software Engineering & Digital Innovation",
  defaultDescription:
    process.env.SITE_DESCRIPTION ||
    "We craft intelligent software platforms, resilient digital products, and innovation ecosystems for forward-looking teams.",
  defaultOgImage: "/api/og/default",
  twitterHandle: process.env.TWITTER_HANDLE || "@yourcompany",
  locale: "en_US",
};

/**
 * Routes that require dynamic SSR meta tags
 */
export const SSR_ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  SCHEDULE: "/schedule",
  BLOG_LIST: "/blogs",
  BLOG_DETAIL: "/blogs/:slug",
  SERVICE_LIST: "/services",
  SERVICE_DETAIL: "/services/:slug",
  PROJECT_LIST: "/projects",
  PROJECT_DETAIL: "/projects/:slug",
  CAREER_LIST: "/careers",
  CAREER_DETAIL: "/careers/:slug",
} as const;
