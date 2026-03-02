import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ServiceEdit from "@/features/dashboard/services/detail/ServiceEdit";

const routeApi = getRouteApi("/dashboard/services/$slug/edit");

export const Route = createLazyFileRoute("/dashboard/services/$slug/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load service. Please return to the list and try again.
      </div>
    );
  }

  return <ServiceEdit serviceId={data.id} />;
}
