/**
 * Template Configuration
 *
 * This is the central configuration file for customizing the template.
 * Update these values to match your company/project branding.
 *
 * For environment-specific values (API URLs, etc.), use .env files.
 */

// =============================================================================
// COMPANY BRANDING
// =============================================================================

export const COMPANY = {
  /** Company/product name */
  name: "Your Company",

  /** Short tagline for the company */
  tagline: "Software Engineering & Digital Innovation",

  /** Full description for SEO and marketing */
  description:
    "We craft intelligent software platforms, resilient digital products, and innovation ecosystems for forward-looking teams.",

  /** Year the company was founded (for copyright) */
  foundedYear: 2024,

  /** Primary contact email */
  email: "contact@example.com",

  /** Physical address (optional) */
  address: "123 Main Street, City, Country",
} as const;

// =============================================================================
// SITE METADATA (SEO & OG)
// =============================================================================

export const SITE = {
  /** Site name for OG tags */
  name: COMPANY.name,

  /** Base URL of the site (set via VITE_SITE_URL env var for flexibility) */
  url: import.meta.env.VITE_SITE_URL || "http://localhost:5173",

  /** Default page title (appears in browser tab) */
  defaultTitle: `${COMPANY.name} | ${COMPANY.tagline}`,

  /** Default meta description */
  defaultDescription: COMPANY.description,

  /** Twitter/X handle (without @) */
  twitterHandle: "yourcompany",

  /** Default locale */
  locale: "en_US",

  /** Primary theme color (used in meta tags, PWA) */
  themeColor: "#0600ab",

  /** Keywords for SEO */
  keywords: [
    "software engineering",
    "digital innovation",
    "product development",
    "cloud platforms",
    "automation",
  ],
} as const;

// =============================================================================
// SOCIAL LINKS
// =============================================================================

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/yourcompany",
  linkedin: "https://www.linkedin.com/company/yourcompany",
  instagram: "https://www.instagram.com/yourcompany",
  github: "https://github.com/yourcompany",
  facebook: "", // Leave empty to hide
  tiktok: "", // Leave empty to hide
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================

export const NAVIGATION = {
  /** Logo text (or replace with logo component in Navbar) */
  logo: COMPANY.name,

  /** Main navigation items */
  items: [
    { label: "About Us", href: "/demo/about" },
    { label: "Services", href: "/demo/services" },
    { label: "Projects", href: "/demo/projects" },
    { label: "Contact Us", href: "/demo/contact" },
  ],

  /** CTA button in header */
  cta: {
    label: "Book a Call",
    href: "/demo/schedule",
  },
} as const;

// =============================================================================
// FOOTER
// =============================================================================

export const FOOTER = {
  sections: [
    {
      title: "Services",
      links: [
        { label: "Web Development", href: "/demo/services/web-development" },
        { label: "Mobile Apps", href: "/demo/services/mobile-apps" },
        { label: "Cloud Solutions", href: "/demo/services/cloud-solutions" },
      ],
    },
    {
      title: "Quick Links",
      links: [
        { label: "Services", href: "/demo/services" },
        { label: "Blogs", href: "/demo/blogs" },
        { label: "Projects", href: "/demo/projects" },
        { label: "Careers", href: "/demo/careers" },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} ${COMPANY.name}. All rights reserved.`,
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURES = {
  /** Enable the demo/marketing landing pages (disable for dashboard-only mode) */
  enableMarketingPages: true,

  /** Enable blog functionality */
  enableBlog: true,

  /** Enable careers/vacancies functionality */
  enableCareers: true,

  /** Enable case studies/projects functionality */
  enableProjects: true,

  /** Enable booking/scheduling functionality */
  enableBooking: true,

  /** Cal.com username for booking (leave empty to disable) */
  calComUsername: "",
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API = {
  /** Base URL for API requests (set via VITE_SERVER_URL env var) */
  baseUrl: import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

/** Combined template configuration */
export const templateConfig = {
  company: COMPANY,
  site: SITE,
  socialLinks: SOCIAL_LINKS,
  navigation: NAVIGATION,
  footer: FOOTER,
  features: FEATURES,
  api: API,
} as const;

export type TemplateConfig = typeof templateConfig;
