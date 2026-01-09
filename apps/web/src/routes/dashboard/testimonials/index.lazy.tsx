import { createLazyFileRoute } from "@tanstack/react-router";

import Testimonials from "@/features/dashboard/testimonials";
import { fetchTestimonials } from "@/features/dashboard/testimonials/lib/testimonials-api";
import { testimonialKeys } from "@/features/dashboard/testimonials/lib/testimonials-query";
import {
  normalizeTestimonialsListParams,
  testimonialsListParamsSchema,
} from "@/features/dashboard/testimonials/lib/testimonials-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/testimonials/")({
  validateSearch: (search: Record<string, unknown>) =>
    testimonialsListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
    }),
  loader: async ({ search }: { search: Record<string, unknown> }) => {
    const params = normalizeTestimonialsListParams(search);
    await prefetchResource(queryClient, testimonialKeys.list(params), () =>
      fetchTestimonials(params),
    );
    return null;
  },
  component: Testimonials,
});
