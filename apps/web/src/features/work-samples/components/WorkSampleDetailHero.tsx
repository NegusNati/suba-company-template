import { ArrowUpRight } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface WorkSampleDetailHeroProps {
  title: string;
  tags: Array<{ id: number; name: string; slug: string }>;
  externalLink?: string | null;
}

export const WorkSampleDetailHero: React.FC<WorkSampleDetailHeroProps> = ({
  title,
  tags,
  externalLink,
}) => {
  const primaryTag = tags[0];

  return (
    <div className="text-center mb-12">
      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
        {title}
      </h1>

      {/* Tag and Link */}
      <div className="flex items-center justify-center gap-3">
        {primaryTag && (
          <Button
            size="sm"
            className="rounded-full px-6 h-10 text-sm font-medium"
          >
            {primaryTag.name}
          </Button>
        )}
        {externalLink && (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Visit Site
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </div>
  );
};
