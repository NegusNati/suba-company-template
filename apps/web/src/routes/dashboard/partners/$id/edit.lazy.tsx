import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import PartnerEdit from "@/features/dashboard/partners/detail/PartnerEdit";

const routeApi = getRouteApi("/dashboard/partners/$id/edit");

export const Route = createLazyFileRoute("/dashboard/partners/$id/edit")({
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

  return <PartnerEdit partnerId={data.id} />;
}
