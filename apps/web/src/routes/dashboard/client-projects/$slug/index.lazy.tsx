import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ClientProjectView from "@/features/dashboard/client-projects/detail/ClientProjectView";

const routeApi = getRouteApi("/dashboard/client-projects/$slug/");

export const Route = createLazyFileRoute("/dashboard/client-projects/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load client project. Please return to the list and try again.
      </div>
    );
  }

  return <ClientProjectView clientProjectId={data.id} />;
}
