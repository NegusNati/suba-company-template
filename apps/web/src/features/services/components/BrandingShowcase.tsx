import { Link } from "@tanstack/react-router";
import React from "react";

import colorsImg from "@/assets/services/branding/colors.svg";
import ergovilLogo from "@/assets/services/branding/social-media-profile.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BrandingShowcaseProps {
  className?: string;
}

export const BrandingShowcase: React.FC<BrandingShowcaseProps> = ({
  className,
}) => {
  return (
    <section
      className={cn(
        "w-full overflow-hidden rounded-[2.5rem] bg-[#EAF2E2]",
        className,
      )}
    >
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-8 md:w-1/2 md:px-12 md:py-12 lg:px-16">
          <h2 className="font-serif leading-tight text-[#1F2628] text-2xl  md:text-4xl ">
            Branding And Rebranding
            <br />
            With Brand Guideline
          </h2>
          <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-[#4D5557] sm:text-base md:mt-6 md:text-md">
            Performant and converting website that is suited to your business
            need and customer experience
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              size="lg"
              className="h-12 w-full rounded-full bg-[#628B35] text-base font-medium text-white shadow-sm hover:bg-[#4f7a28] sm:w-auto"
              asChild
            >
              <Link to="/demo/schedule">Book A Call</Link>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-full text-base font-medium text-[#628B35] hover:bg-[#628B35]/10 hover:text-[#4f7a28] sm:w-auto"
              asChild
            >
              <Link to="/demo/projects">View Client Projects</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex w-full items-end justify-center bg-gradient-to-br from-[#121514] to-[#070909]  md:w-1/2 ">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
          >
            <div className="absolute -left-24 -top-28 size-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-24 -bottom-28 size-80 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="grid grid-cols-1 w-full max-w-[720px]">
            <div className="overflow-hidden border border-white/10 bg-black/20 flex justify-center items-center gap-4 p-6 ">
              <img
                src={ergovilLogo}
                alt="Analytics dashboard design mockup"
                className="h-auto w-full"
              />
              <p className="text-white hidden md:block">
                Ergolevel positions itself as a specialized ergonomic partner
                dedicated to workspace health.
              </p>
            </div>
            <div>
              <img
                src={colorsImg}
                alt="Analytics dashboard design mockup"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
