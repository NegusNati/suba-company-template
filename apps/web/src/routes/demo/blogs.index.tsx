import { createFileRoute } from "@tanstack/react-router";

import { BlogsPage } from "@/features/blog";

export const Route = createFileRoute("/demo/blogs/")({
  component: BlogRoute,
});

function BlogRoute() {
  return <BlogsPage />;
}
