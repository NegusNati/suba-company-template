import { Link } from "@tanstack/react-router";
import React from "react";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ServiceShowcaseProps {
  title: string;
  description: string;
  image: string;
  cta?: {
    text: string;
    link: string;
  };
  secondaryCta?: {
    text: string;
    link: string;
  };
  className?: string;
  reverse?: boolean; // Option to flip content/image sides
}

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({
  title,
  description,
  image,
  cta,
  secondaryCta,
  className,
  reverse = false,
}) => {
  return (
    <div
      className={cn(
        "w-full bg-[#EAF2E2] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[300px] md:h-[500px]", // Static height on desktop
        reverse && "md:flex-row-reverse",
        className,
      )}
    >
      {/* Content Side */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start">
        <h2 className="font-serif text-2xl md:text-4xl leading-tight text-[#1F2628] mb-6">
          {title}
        </h2>
        <p className="my-4 max-w-md text-sm font-light leading-relaxed text-[#4D5557] sm:text-base md:mt-6 md:text-md">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {cta && (
            <Button
              className="bg-[#628B35] text-white hover:bg-[#4f7a28] rounded-full px-8 py-6 text-base font-medium shadow-sm transition-transform hover:-translate-y-1"
              asChild
            >
              <Link to={cta.link}>{cta.text}</Link>
            </Button>
          )}

          {secondaryCta && (
            <Button
              variant="ghost"
              className="text-[#628B35] hover:bg-[#628B35]/10 hover:text-[#4f7a28] rounded-full px-6 py-6 text-base font-medium"
              asChild
            >
              <Link to={secondaryCta.link}>{secondaryCta.text}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Images Side */}
      <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px] bg-gradient-to-br from-transparent to-white/20 flex items-end justify-center">
        <div className="w-full h-full flex items-end justify-center pl-8">
          <AppImage
            src={image}
            alt={title}
            className="w-full h-auto max-h-full object-contain object-bottom"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
};
