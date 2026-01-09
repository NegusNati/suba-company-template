import { createFileRoute } from "@tanstack/react-router";

import TestimonialEdit from "@/features/dashboard/testimonials/detail/TestimonialEdit";
import { fetchTestimonialById } from "@/features/dashboard/testimonials/lib/testimonials-api";
import { testimonialKeys } from "@/features/dashboard/testimonials/lib/testimonials-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/testimonials/$id/edit")({
  loader: async ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(
        "Missing testimonial id. Please navigate from the testimonials list.",
      );
    }

    await prefetchResource(queryClient, testimonialKeys.detail(id), () =>
      fetchTestimonialById(id),
    );

    return { id };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load testimonial. Please return to the list and try again.
      </div>
    );
  }

  return <TestimonialEdit testimonialId={data.id} />;
}
