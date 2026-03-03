import React from "react";

import {
  BrandingShowcase,
  HostingShowcase,
  type ServiceCarouselItem,
  ServicesCarousel,
  ServiceShowcase,
} from "./components";

import mobileReverseImg from "@/assets/services/mobile_revers.webp";
import iphoneImg from "@/assets/services/Screen.png";
import screenImg from "@/assets/services/us_addis_hotel.webp";
import { ContactCTASection } from "@/components/common/ContactCTASection";

const FEATURED_SERVICES: ServiceCarouselItem[] = [
  {
    id: "web-design",
    title: "Tailored Website Design And Development",
    description:
      "Performant and converting website that is suited to your business need and customer experience",
    image: screenImg,
    ctaText: "Request a Quote",
    ctaLink: "/contact",
    secondaryCtaText: "View Client Projects",
    secondaryCtaLink: "/projects",
  },
  {
    id: "app-dev",
    title: "Mobile Application Development1",
    description:
      "Native and cross-platform mobile apps designed for high performance and user engagement.",
    image: iphoneImg,
    ctaText: "Request a Quote",
    ctaLink: "/contact",
    secondaryCtaText: "View Client Projects",
    secondaryCtaLink: "/projects",
  },
];

export const Services: React.FC = () => {
  return (
    <div className="w-full min-h-screen pb-20">
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-20 content-auto">
        <ServicesCarousel items={FEATURED_SERVICES} />

        <ServiceShowcase
          title="Mobile Application Design And Development"
          description="Performant and converting website that is suited to your business need and customer experience"
          image={mobileReverseImg}
          cta={{ text: "Request a Quote", link: "/contact" }}
          secondaryCta={{ text: "View Client Projects", link: "/projects" }}
        />

        <BrandingShowcase />

        <HostingShowcase />
        <ContactCTASection />
      </div>
    </div>
  );
};
