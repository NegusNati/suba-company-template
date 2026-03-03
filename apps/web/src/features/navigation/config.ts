import type { LandingCtaConfig, LandingNavItem } from "@/types/navigation";
import { landingPagePaths } from "@/types/navigation";

export type SocialLink = {
  id: "x" | "linkedin" | "instagram";
  label: string;
  url: string;
};

export const landingNavItems: LandingNavItem[] = [
  {
    page: "about",
    label: "About Us",
    path: landingPagePaths.about,
    description: "Story, leadership, and values",
  },
  {
    page: "services",
    label: "Services",
    path: landingPagePaths.services,
    description: "Strategy, design, and build offers",
  },
  {
    page: "sectors",
    label: "Business Sectors",
    path: landingPagePaths.sectors,
    description: "Industry-specific service portfolios",
  },
  {
    page: "blogs",
    label: "Blogs",
    path: landingPagePaths.blogs,
    description: "Insights and engineering notes",
  },
  {
    page: "careers",
    label: "Careers",
    path: landingPagePaths.careers,
    description: "Open roles and applications",
  },
  {
    page: "projects",
    label: "Work Samples",
    path: landingPagePaths.projects,
    description: "Case studies & launches",
  },
  {
    page: "gallery",
    label: "Gallery",
    path: landingPagePaths.gallery,
    description: "Moments from events and team culture",
  },
  {
    page: "contact",
    label: "Contact Us",
    path: landingPagePaths.contact,
    description: "Locations, inboxes, and socials",
  },
];

export const landingCtas: LandingCtaConfig[] = [
  {
    id: "book-call",
    label: "Book a Call",
    page: "booking",
    variant: "primary",
    description: "Jump straight into the scheduling experience.",
  },
  {
    id: "contact-sales",
    label: "Contact Team",
    page: "contact",
    variant: "outline",
    description: "Prefer email? Send a note to the studio.",
  },
];

export const landingSocials: SocialLink[] = [
  {
    id: "x",
    label: "X (Formerly Twitter)",
    url: "https://x.com/yourcompany",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/yourcompany",
  },
  {
    id: "instagram",
    label: "Instagram",
    url: "https://instagram.com/yourcompany",
  },
];
