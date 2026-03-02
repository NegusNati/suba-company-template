import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import TestimonialEdit from "@/features/dashboard/testimonials/detail/TestimonialEdit";

const routeApi = getRouteApi("/dashboard/testimonials/$id/edit");

export const Route = createLazyFileRoute("/dashboard/testimonials/$id/edit")({
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

  return <TestimonialEdit testimonialId={data.id} />;
}
