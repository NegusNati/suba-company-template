import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import React from "react";

import type { WorkSampleListItem } from "../lib/types";
import { getWorkSampleImageUrl } from "../lib/work-samples-utils";

import { Button } from "@/components/ui/button";
import { DotPattern } from "@/features/components/DotPattern";

interface WorkSampleCardProps {
  sample: WorkSampleListItem;
  index: number;
}

export const WorkSampleCard: React.FC<WorkSampleCardProps> = ({
  sample,
  index,
}) => {
  const imageUrl = getWorkSampleImageUrl(sample.featuredImage);
  const detailPath = `/projects/${sample.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link
        to={detailPath}
        className="block"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        {/* Image Container */}
        <div className="bg-primary/10 rounded-xl h-48 md:h-56 w-full mb-4 overflow-hidden relative border border-primary/20 transition-colors group-hover:border-primary/40">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={sample.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <DotPattern small />
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-serif font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
            {sample.title}
          </h3>
          {sample.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {sample.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              size="sm"
              className="rounded-full px-4 h-9 text-xs font-medium"
            >
              {sample.type === "case-study" ? "Case Study" : "Product"}
            </Button>
            <button className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors">
              Visit Site
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
