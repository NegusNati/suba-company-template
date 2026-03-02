import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import PartnerView from "@/features/dashboard/partners/detail/PartnerView";

const routeApi = getRouteApi("/dashboard/partners/$id/");

export const Route = createLazyFileRoute("/dashboard/partners/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load partner. Please return to the list and try again.
      </div>
    );
  }

  return <PartnerView partnerId={data.id} />;
}
