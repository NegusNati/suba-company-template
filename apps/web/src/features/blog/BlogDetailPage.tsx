import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React, { useMemo, useRef } from "react";

import {
  BlogAuthorCard,
  BlogDetailHero,
  ReadingProgressIndicator,
} from "./components";
import { useBlogListQuery } from "./lib/blog-query";
import type { BlogDetail } from "./lib/blog-schema";
import {
  formatBlogDate,
  formatReadTime,
  getAuthorAvatarUrl,
  getAuthorHandle,
  getBlogImageUrl,
} from "./lib/blog-utils";

import { AppImage } from "@/components/common/AppImage";
import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { AmharicLetterAnimation } from "@/components/motion-primitives/amharic-letter-animation";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/features/components/DotPattern";

interface BlogDetailPageProps {
  blog: BlogDetail;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ blog }) => {
  const { data: listData } = useBlogListQuery({ page: 1, limit: 6 });
  const contentRef = useRef<HTMLDivElement>(null);

  const tagName = blog.tags?.[0]?.name ?? "Blog";

  const moreBlogs = useMemo(() => {
    const items = listData?.data ?? [];
    return items.filter((item) => item.slug !== blog.slug).slice(0, 3);
  }, [listData?.data, blog.slug]);

  return (
    <div className="w-full  min-h-screen pb-20 pt-9 relative">
      {/* Background Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AmharicLetterAnimation
          letterCount={30}
          minSize={10}
          maxSize={24}
          minDuration={4}
          maxDuration={8}
          color="rgb(98 139 53/0.2)"
          className="translate-y-[-169px]"
        />
      </div>

      <h1 className="text-center text-3xl md:text-[40px] font-serif font-semibold text-foreground mb-10 leading-tight relative z-10">
        {blog.title}
      </h1>

      <div className="px-6 py-8 max-w-4xl mx-auto relative z-10">
        {/* Reading Progress Indicator */}
        <ReadingProgressIndicator targetRef={contentRef} />

        {/* Content wrapper with ref for progress tracking */}
        <div ref={contentRef}>
          <div className="flex items-center gap-4 mb-8">
            <Link to={"/blogs" as never}>
              <Button
                variant="ghost"
                className="text-sm uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-2 group p-0 hover:bg-transparent"
              >
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Blogs
              </Button>
            </Link>
            <div className="h-px flex-1 bg-[#e0e6d7]" />
          </div>

          <BlogDetailHero
            imageUrl={blog.featuredImageUrl}
            date={formatBlogDate(blog.publishDate)}
            readTime={formatReadTime(blog.readTimeMinutes)}
            tag={tagName}
          />

          {/* Blog Content */}
          <div className="mb-16 text-[15px] leading-7 text-[#444]">
            <LexicalViewer content={blog.content} />
          </div>

          {/* Author Card */}
          {blog.author && (
            <BlogAuthorCard
              name={blog.author.name}
              handle={getAuthorHandle(blog.author.name)}
              avatarUrl={getAuthorAvatarUrl(
                blog.author.image,
                blog.author.name,
              )}
              socials={blog.author.socials}
            />
          )}
        </div>

        {/* More Like This */}
        {moreBlogs.length > 0 && (
          <div className="mt-16 md:mt-20">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm uppercase tracking-[0.08em] text-muted-foreground">
                More Like This
              </span>
              <div className="h-px flex-1 bg-[#e0e6d7]" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {moreBlogs.map((item) => (
                <Link
                  key={item.id}
                  to="/demo/blogs/$slug"
                  params={{ slug: item.slug }}
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="group rounded-2xl border border-[#e0e6d7]  flex flex-col h-full hover:border-primary/60 transition-colors"
                >
                  <div className=" h-32 rounded-t-lg overflow-hidden ">
                    {getBlogImageUrl(item.featuredImageUrl) ? (
                      <AppImage
                        src={getBlogImageUrl(item.featuredImageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DotPattern small />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] text-muted-foreground mb-2">
                      {formatBlogDate(item.publishDate)}
                    </div>
                    <h3 className="text-sm font-serif font-semibold text-foreground leading-snug mb-2 group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
