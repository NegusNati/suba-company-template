import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import React from "react";

import type { BlogPost } from "../lib/types";

import { AppImage } from "@/components/common/AppImage";
import { DotPattern } from "@/features/components/DotPattern";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Link
      to="/demo/blogs/$slug"
      params={{ slug: post.slug }}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      className="flex gap-4 md:flex-col group cursor-pointer"
    >
      <div className="w-24 h-20 md:w-full md:h-48 bg-primary/10 rounded-xl flex-shrink-0 overflow-hidden border border-primary/20 transition-colors group-hover:border-primary/40">
        {post.imageUrl ? (
          <AppImage
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <DotPattern small />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm md:text-lg font-serif font-medium text-foreground mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center text-[10px] md:text-xs text-gray-400 font-medium">
          <span>{post.date}</span>
          <span className="mx-1.5">•</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);
