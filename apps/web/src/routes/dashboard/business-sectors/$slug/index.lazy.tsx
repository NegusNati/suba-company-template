import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import SectorView from "@/features/dashboard/business-sectors/detail/SectorView";

const routeApi = getRouteApi("/dashboard/business-sectors/$slug/");

export const Route = createLazyFileRoute("/dashboard/business-sectors/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load business sector. Please return to the list and try again.
      </div>
    );
  }

  return <SectorView sectorId={data.id} />;
}
