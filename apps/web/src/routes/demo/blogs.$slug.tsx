import { createFileRoute } from "@tanstack/react-router";

import { BlogDetailPage } from "@/features/blog";
import { fetchPublicBlogBySlug } from "@/features/blog/lib/blog-api";
import { getBlogOgImageUrl, SITE_METADATA } from "@/lib/og-utils";

export const Route = createFileRoute("/demo/blogs/$slug")({
  loader: async ({ params }: { params: Record<string, string> }) => {
    const data = await fetchPublicBlogBySlug(params.slug);
    return { blog: data.data };
  },
  head: ({ loaderData }) => {
    const blog = loaderData?.blog;
    const title = blog?.title
      ? `${blog.title} | ${SITE_METADATA.siteName}`
      : SITE_METADATA.defaultTitle;
    const description = blog?.excerpt || SITE_METADATA.defaultDescription;
    const ogImage = blog?.slug
      ? getBlogOgImageUrl(blog.slug)
      : `${SITE_METADATA.siteUrl}/og_image.webp`;
    const url = blog?.slug
      ? `${SITE_METADATA.siteUrl}/blogs/${blog.slug}`
      : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // Open Graph
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: SITE_METADATA.siteName },
        ...(url ? [{ property: "og:url", content: url }] : []),
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  component: BlogDetailRoute,
});

function BlogDetailRoute() {
  const { blog } = Route.useLoaderData();
  return <BlogDetailPage blog={blog} />;
}
