import React from "react";

import hostingImg from "@/assets/services/hosting.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HostingShowcaseProps {
  className?: string;
}

export const HostingShowcase: React.FC<HostingShowcaseProps> = ({
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Card Container */}
      <div className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#628B35] to-transparent/5 h-[500px] md:h-[650px] flex flex-col pt-8 px-6 md:px-12 lg:px-16">
        {/* Top Section: Content Grid */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12 relative z-10 w-full mb-8">
          {/* Left Column: Title */}
          <div className="w-full md:w-1/2">
            <h2 className="font-serif text-xl md:text-3xl lg:text-5xl leading-tight text-white">
              Hosting And Maintenance With Reliability
            </h2>
          </div>

          {/* Right Column: Description + Buttons */}
          <div className="w-full md:w-1/2 md:max-w-md pt-2 md:pt-4">
            <p className="text-white/90 text-sm md:text-base lg:text-lg mb-8 font-light leading-relaxed">
              Performant and converting website that is suited to your business
              need and customer experience
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                className="bg-white text-[#628B35] hover:bg-white/90 hover:text-[#4f7a28] rounded-full px-8 py-6 text-base font-medium shadow-sm transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <a href="/contact">Book A Call</a>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white rounded-full px-6 py-6 text-base font-medium"
                asChild
              >
                <a href="/projects">View Client Projects</a>
              </Button>
            </div>
          </div>
        </div>
        <div
          className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t to-transparent"
          aria-hidden
        />

        {/* Bottom Section: Image */}
        <div className="relative flex-1 w-full flex items-end justify-center mt-auto">
          <div className="relative w-full max-w-6xl mx-auto transform md:translate-y-[5%] scale-[1.6] md:scale-[1.2] transition-transform duration-700 ease-out hover:scale-[1.02]">
            <img
              src={hostingImg}
              alt="Hosting and Maintenance Dashboard"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
