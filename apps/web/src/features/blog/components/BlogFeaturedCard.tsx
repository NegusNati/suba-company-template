import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import React from "react";

import { DotPattern } from "@/features/components/DotPattern";

interface BlogFeaturedCardProps {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  imageUrl?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const BlogFeaturedCard: React.FC<BlogFeaturedCardProps> = ({
  slug,
  title,
  date,
  readTime,
  tag,
  imageUrl,
}) => (
  <motion.div variants={itemVariants} initial="hidden" animate="show">
    <Link
      to="/demo/blogs/$slug"
      params={{ slug }}
      className="group cursor-pointer md:grid md:grid-cols-2 md:gap-12 md:items-center block"
    >
      <div className="bg-primary/10 rounded-2xl h-48 md:h-80 w-full mb-5 md:mb-0 overflow-hidden relative border border-primary/20 transition-colors group-hover:border-primary/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <DotPattern />
        )}
      </div>

      <div>
        <div className="inline-block bg-gray-100 rounded-md px-3 py-1.5 mb-4">
          <span className="text-[10px] md:text-xs font-medium text-gray-600">
            {tag}
          </span>
        </div>
        <h3 className="text-lg md:text-3xl font-serif font-medium text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center text-xs md:text-sm text-gray-500 font-medium">
          <span>{date}</span>
          <span className="mx-2">•</span>
          <span>{readTime}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);
