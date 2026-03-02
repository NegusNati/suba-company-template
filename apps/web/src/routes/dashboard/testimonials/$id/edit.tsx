import { createFileRoute } from "@tanstack/react-router";

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
});
