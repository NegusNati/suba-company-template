import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import TestimonialView from "@/features/dashboard/testimonials/detail/TestimonialView";

const routeApi = getRouteApi("/dashboard/testimonials/$id/");

export const Route = createLazyFileRoute("/dashboard/testimonials/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load testimonial. Please return to the list and try again.
      </div>
    );
  }

  return <TestimonialView testimonialId={data.id} />;
}
