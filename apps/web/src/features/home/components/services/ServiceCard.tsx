import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image?: string; // Image URL for the visual area
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * A single service card component that displays:
 * - Visual area with a service image in green container
 * - Icon + title on one line
 * - Description text
 * - "Get a Quote" and "Learn More" CTA buttons
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  image,
  isActive = false,
  onClick,
  className = "",
}) => {
  return (
    <div
      className={`
        bg-white rounded-3xl transition-all duration-300
        ${isActive ? "ring-2 ring-primary/20" : ""}
        ${onClick ? "cursor-pointer hover:shadow-lg" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Visual area - service image in green container */}
      {image && (
        <div className="w-full h-[320px] md:h-[360px] bg-[#E9F3E6] rounded-3xl flex items-center justify-center overflow-hidden p-4">
          <img
            src={image}
            alt={title}
            className={cn("w-full h-full object-contain")}
          />
        </div>
      )}

      {/* Content area */}
      <div className="px-2 py-6">
        {/* Icon and Title */}
        <div className="flex gap-3 items-center mb-3">
          <span className="w-8 h-8 flex items-center justify-center text-primary">
            <Icon size={24} strokeWidth={1.5} />
          </span>
          <h3 className="text-lg md:text-xl font-serif text-primary">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-500 font-light leading-relaxed mb-6 text-sm md:text-base">
          {description}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-6">
          <button className="bg-primary hover:bg-[#54763d] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Get a Quote
          </button>
          <button className="text-primary hover:text-[#54763d] text-sm font-medium flex items-center gap-1.5 group transition-colors">
            Learn More
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
