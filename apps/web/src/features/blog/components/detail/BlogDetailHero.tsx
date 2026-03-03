import React from "react";

import { getBlogImageUrl } from "../../lib/blog-utils";

import { AppImage } from "@/components/common/AppImage";
import { DotPattern } from "@/features/components/DotPattern";

interface BlogDetailHeroProps {
  imageUrl: string | null | undefined;
  date: string;
  readTime: string;
  tag: string;
}

export const BlogDetailHero: React.FC<BlogDetailHeroProps> = ({
  imageUrl,
  date,
  readTime,
  tag,
}) => {
  const fullImageUrl = getBlogImageUrl(imageUrl);

  return (
    <>
      {/* Featured Image */}
      <div className="bg-primary/10 rounded-3xl h-56 md:h-[420px] w-full mb-10 overflow-hidden relative border border-[#e3e7da]">
        {fullImageUrl ? (
          <AppImage
            src={fullImageUrl}
            alt="Blog featured image"
            className="w-full h-full object-cover"
          />
        ) : (
          <DotPattern />
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between mb-10 text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center gap-2 md:gap-3 font-medium">
          <span>{date}</span>
          <span className="mx-1">•</span>
          <span>{readTime}</span>
        </div>
        <div className="rounded-full border border-[#e3e7da] px-3 py-1.5 bg-white text-[10px] md:text-xs font-medium text-gray-600">
          {tag}
        </div>
      </div>
    </>
  );
};
