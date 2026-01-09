import { COMPANY, FOOTER, NAVIGATION, SOCIAL_LINKS } from "./template";

import instagram from "@/assets/tech-logo/InstagramLogo.svg";
import Linkedin from "@/assets/tech-logo/LinkedinLogo.svg";
import X from "@/assets/tech-logo/XLogo.svg";

type NavigationLink = {
  label: string;
  href: string;
};

type NavItem = NavigationLink & {
  submenu?: NavigationLink[];
};

type FooterSection = {
  title: string;
  links: NavigationLink[];
};

type SocialLink = {
  platform: string;
  url: string;
  icon: string;
};

export const products = [
  { label: "Product 1", href: "/demo/products/product-1" },
  { label: "Product 2", href: "/demo/products/product-2" },
  { label: "Product 3", href: "/demo/products/product-3" },
];

export const navigationConfig = {
  logo: NAVIGATION.logo,
  items: [...NAVIGATION.items] as NavItem[],
  ctaLabel: NAVIGATION.cta.label,
  ctaHref: NAVIGATION.cta.href,
};

export const footerConfig = {
  sections: [
    {
      title: "Products",
      links: products,
    },
    ...FOOTER.sections.map((section) => ({
      title: section.title,
      links: [...section.links],
    })),
  ] as FooterSection[],
  socialLinks: [
    ...(SOCIAL_LINKS.linkedin
      ? [{ platform: "LinkedIn", url: SOCIAL_LINKS.linkedin, icon: Linkedin }]
      : []),
    ...(SOCIAL_LINKS.twitter
      ? [{ platform: "X (Twitter)", url: SOCIAL_LINKS.twitter, icon: X }]
      : []),
    ...(SOCIAL_LINKS.instagram
      ? [
          {
            platform: "Instagram",
            url: SOCIAL_LINKS.instagram,
            icon: instagram,
          },
        ]
      : []),
  ] as SocialLink[],
  companyInfo: {
    name: COMPANY.name,
    description: COMPANY.description,
    address: COMPANY.address,
    copyright: FOOTER.copyright,
  },
};
