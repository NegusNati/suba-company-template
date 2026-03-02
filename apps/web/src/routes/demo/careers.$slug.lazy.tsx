import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import { CareerDetailPage } from "@/features/careers";

const routeApi = getRouteApi("/demo/careers/$slug");

export const Route = createLazyFileRoute("/demo/careers/$slug")({
  component: CareerDetailRoute,
});

function CareerDetailRoute() {
  const { vacancy } = routeApi.useLoaderData();
  return <CareerDetailPage vacancy={vacancy} />;
}
