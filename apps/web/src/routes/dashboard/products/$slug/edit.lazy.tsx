import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ProductEdit from "@/features/dashboard/products/detail/ProductEdit";

const routeApi = getRouteApi("/dashboard/products/$slug/edit");

export const Route = createLazyFileRoute("/dashboard/products/$slug/edit")({
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

  return <ProductEdit productId={data.id} />;
}
