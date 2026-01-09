import React, { useState } from "react";

import { BlogCardGrid, BlogFeaturedCard, BlogSearchBar } from "./components";
import { useBlogListQuery } from "./lib/blog-query";
import {
  formatBlogDate,
  formatReadTime,
  getBlogImageUrl,
} from "./lib/blog-utils";

import BookACall from "@/components/common/book-a-call";
import AmharicLetterAnimation from "@/components/motion-primitives/amharic-letter-animation";
import { useDebounce } from "@/lib/use-debounce";

interface BlogsPageProps {
  initialQuery?: string;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 400);

  const { data, isPending } = useBlogListQuery({
    page: 1,
    limit: 12,
    search: debouncedQuery,
  });

  const blogs = data?.data ?? [];
  const featuredBlog = blogs[0];

  return (
    <>
      <div className="w-full h-[200px]  overflow-hidden relative">
        <AmharicLetterAnimation
          letterCount={70}
          minSize={16}
          maxSize={24}
          minDuration={6}
          maxDuration={16}
          color="rgb(98 139 53/0.2)"
          className="translate-y-[-20px] z-10"
        />
      </div>

      <div className="w-full mt-[-20px]  min-h-screen pb-20">
        <div className="px-6 pb-8 max-w-7xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <h1 className="text-[32px] md:text-5xl font-serif font-medium text-foreground tracking-tight">
              Blogs
            </h1>
            <BlogSearchBar
              value={query}
              onChange={(value) => setQuery(value)}
              onSubmit={(value) => setQuery(value)}
            />
          </header>

          {featuredBlog && (
            <section className="mb-16">
              <h2 className="mb-6 text-xl font-serif font-medium text-foreground">
                Our Latest Blog
              </h2>
              <BlogFeaturedCard
                slug={featuredBlog.slug}
                title={featuredBlog.title}
                date={formatBlogDate(featuredBlog.publishDate)}
                readTime={formatReadTime(featuredBlog.readTimeMinutes)}
                tag="Blog"
                imageUrl={getBlogImageUrl(featuredBlog.featuredImageUrl)}
              />
            </section>
          )}

          <section className="space-y-8">
            <h2 className="text-xl font-serif font-medium text-foreground">
              Recent Blogs
            </h2>
            <BlogCardGrid
              posts={blogs.map((blog) => ({
                id: blog.id,
                slug: blog.slug,
                title: blog.title,
                date: formatBlogDate(blog.publishDate),
                readTime: formatReadTime(blog.readTimeMinutes),
                imageUrl: getBlogImageUrl(blog.featuredImageUrl),
              }))}
            />
            {isPending && (
              <p className="text-sm text-muted-foreground">Loading blogs...</p>
            )}
          </section>

          <BookACall />
        </div>
      </div>
    </>
  );
};
