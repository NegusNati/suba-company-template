import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import React from "react";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import { getWorkSampleImageUrl } from "@/features/work-samples/lib/work-samples-utils";
import { cn } from "@/lib/utils";

export interface WorkSampleProject {
  title: string;
  image: string;
  siteUrl?: string;
  caseStudyUrl?: string;
}

interface WorkSampleCardProps {
  project: WorkSampleProject;
  className?: string;
}

export const WorkSampleCard: React.FC<WorkSampleCardProps> = ({
  project,
  className,
}) => {
  const imageUrl = getWorkSampleImageUrl(project.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-muted p-5 cursor-pointer",
        className,
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
        <AppImage
          src={imageUrl || ""}
          alt={project.title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay with Buttons - Always visible on mobile, hover on desktop */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 pb-6 pt-16 bg-gradient-to-t from-black/50 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] rounded-b-xl">
          {project.siteUrl && (
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 py-2 text-xs font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                window.open(project.siteUrl, "_blank");
              }}
            >
              Visit Site
            </Button>
          )}
          {project.caseStudyUrl && (
            <Button
              variant="outline"
              size="sm"
              className="bg-card/90 hover:bg-card text-primary border-0 rounded-full px-5 py-2 text-xs font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
              asChild
            >
              <Link
                to={project.caseStudyUrl}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  e.stopPropagation()
                }
              >
                Case Study
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
