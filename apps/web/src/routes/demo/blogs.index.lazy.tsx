import { createLazyFileRoute } from "@tanstack/react-router";

import { BlogsPage } from "@/features/blog";

export const Route = createLazyFileRoute("/demo/blogs/")({
  component: BlogRoute,
});

function BlogRoute() {
  return <BlogsPage />;
}
