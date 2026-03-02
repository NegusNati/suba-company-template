import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import BlogDetail from "@/features/dashboard/blogs/detail/BlogDetail";

const routeApi = getRouteApi("/dashboard/blogs/$slug/");

export const Route = createLazyFileRoute("/dashboard/blogs/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-6 text-destructive">
        Unable to load blog. Please return to the list and try again.
      </div>
    );
  }

  return <BlogDetail blogId={data.id} mode="view" />;
}
