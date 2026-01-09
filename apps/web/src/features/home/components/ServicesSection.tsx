import { Link } from "@tanstack/react-router";
import { Globe, Smartphone, Component, Server, ArrowRight } from "lucide-react";
import React, { useState, useEffect } from "react";

// Import service images
import { ServiceCard } from "./services";

import brandingImage from "@/assets/landing/services/branding.webp";
import mobileImage from "@/assets/landing/services/mobile.webp";
import statImage from "@/assets/landing/services/stat.webp";
import webImage from "@/assets/landing/services/web.webp";
import { Button } from "@/components/ui/button";

// --- MAIN SERVICE DATA ---
const services = [
  {
    id: "web",
    title: "Website Design & Development",
    description:
      "We iterate on the design first, then follow a code-first build — using low-code only when fast turnaround is needed.",
    icon: Globe,
    image: webImage,
  },
  {
    id: "mobile",
    title: "Mobile Design & Development",
    description:
      "Design refinement first, then Flutter development for both iOS and Android to ensure native performance.",
    icon: Smartphone,
    image: mobileImage,
  },
  {
    id: "branding",
    title: "Branding & Rebranding",
    description:
      "We create and refine brand identities and refresh existing ones to match modern standards and customer expectations.",
    icon: Component,
    image: brandingImage,
  },
  {
    id: "hosting",
    title: "Hosting and Monitoring",
    description:
      "Reliable hosting, continuous maintenance, and user-friendly analytics to keep your digital assets performing at their peak.",
    icon: Server,
    image: statImage,
  },
];

const ServicesSection: React.FC = () => {
  const [activeService, setActiveService] = useState(0);

  // Auto-rotate the text/active service on desktop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % services.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const currentService = services[activeService];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 leading-tight">
            Our Services For{" "}
            <span className="italic">Your Business Growth</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto font-light">
            From branding, through web and mobile design and development, we do
            it all
          </p>
        </div>

        {/* Mobile Layout: All cards vertically stacked */}
        <div className="md:hidden space-y-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
              image={service.image}
            />
          ))}
        </div>

        {/* Desktop Layout: Two-column with interactive cards */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <div className="order-2 lg:order-1 relative min-h-[300px]">
            <div className="transition-all duration-500 ease-in-out">
              <div className="flex gap-2 align-center items-center">
                <span className="w-14 h-14 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary mb-6 transition-all duration-300 ">
                  {" "}
                  {React.createElement(currentService.icon, {
                    size: 28,
                    strokeWidth: 1.5,
                  })}{" "}
                </span>
                <h3 className="text-3xl font-serif text-primary mb-6 transition-all duration-300 min-h-[2.5rem]  ">
                  {currentService.title}
                </h3>
              </div>
              <p className="text-gray-500 font-light leading-relaxed mb-10 text-lg min-h-[5rem] transition-all duration-300">
                {currentService.description}
              </p>

              <div className="flex items-center gap-8 mb-12">
                <Link to="/demo/contact">
                  <Button className="bg-primary hover:bg-[#54763d] text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Get a Quote
                  </Button>
                </Link>
                <Link to="/demo/services">
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-primary font-medium flex items-center gap-2 group transition-colors"
                  >
                    Learn More
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {services.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveService(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === activeService
                        ? "w-12 bg-primary"
                        : "w-2 bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="order-1 lg:order-2 relative group  h-[300px] md:h-[450px] flex items-center justify-center z-0">
            {/* The Green Container Background */}
            <div className="absolute inset-0 transition-all duration-700 p-4 bg-secondary rounded-[2.5rem] "></div>

            <div
              className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-linear-to-t to-transparent"
              aria-hidden
            />

            {/* Content Container */}
            <div className="w-full h-full flex items-center justify-center z-10">
              <div
                key={currentService.id}
                className="w-full h-full flex items-center justify-center animate-fade-in-up "
              >
                <img
                  src={currentService.image}
                  alt={currentService.title}
                  className="max-w-full max-h-full object-contain rounded-2xl px-4 translate-y-[30px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
