import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ClientProjectEdit from "@/features/dashboard/client-projects/detail/ClientProjectEdit";

const routeApi = getRouteApi("/dashboard/client-projects/$slug/edit");

export const Route = createLazyFileRoute(
  "/dashboard/client-projects/$slug/edit",
)({
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

  return <ClientProjectEdit clientProjectId={data.id} />;
}
