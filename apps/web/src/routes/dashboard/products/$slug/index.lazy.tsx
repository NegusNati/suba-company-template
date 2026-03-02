import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ProductView from "@/features/dashboard/products/detail/ProductView";

const routeApi = getRouteApi("/dashboard/products/$slug/");

export const Route = createLazyFileRoute("/dashboard/products/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load product. Please return to the list and try again.
      </div>
    );
  }

  return <ProductView productId={data.id} />;
}
