import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ServiceView from "@/features/dashboard/services/detail/ServiceView";

const routeApi = getRouteApi("/dashboard/services/$slug/");

export const Route = createLazyFileRoute("/dashboard/services/$slug/")({
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

  return <ServiceView serviceId={data.id} />;
}
