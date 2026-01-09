import React from "react";

import { BlogCard } from "./BlogCard";
import type { BlogPost } from "../lib/types";

interface BlogCardGridProps {
  posts: BlogPost[];
}

export const BlogCardGrid: React.FC<BlogCardGridProps> = ({ posts }) => (
  <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8">
    {posts.map((post, index) => (
      <BlogCard key={post.id} index={index} post={post} />
    ))}
  </div>
);
