import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import { BlogDetailPage } from "@/features/blog";

const routeApi = getRouteApi("/demo/blogs/$slug");

export const Route = createLazyFileRoute("/demo/blogs/$slug")({
  component: BlogDetailRoute,
});

function BlogDetailRoute() {
  const { blog } = routeApi.useLoaderData();
  return <BlogDetailPage blog={blog} />;
}
