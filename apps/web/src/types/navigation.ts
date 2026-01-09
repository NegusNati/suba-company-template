export type LandingPage =
  | "home"
  | "about"
  | "services"
  | "blogs"
  | "blogDetail"
  | "careers"
  | "booking"
  | "contact"
  | "projects";

export type Page = LandingPage;

export interface LandingNavItem {
  page: LandingPage;
  label: string;
  path: string;
  hasSubmenu?: boolean;
  description?: string;
}

export interface LandingCtaConfig {
  id: string;
  label: string;
  page: LandingPage;
  description?: string;
  variant?: "primary" | "secondary" | "outline";
}

/**
 * Landing page paths relative to the demo route prefix.
 * In production, you may want to change the prefix or remove it entirely.
 */
const DEMO_PREFIX = "/demo";

export const landingPagePaths: Record<LandingPage, string> = {
  home: `${DEMO_PREFIX}`,
  about: `${DEMO_PREFIX}/about`,
  services: `${DEMO_PREFIX}/services`,
  blogs: `${DEMO_PREFIX}/blogs`,
  blogDetail: `${DEMO_PREFIX}/blogs/$slug`,
  careers: `${DEMO_PREFIX}/careers`,
  booking: `${DEMO_PREFIX}/schedule`,
  contact: `${DEMO_PREFIX}/contact`,
  projects: `${DEMO_PREFIX}/projects`,
};
