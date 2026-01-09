import { createLazyFileRoute } from "@tanstack/react-router";

import { TestimonialForm } from "@/features/dashboard/testimonials/TestimonialForm";

export const Route = createLazyFileRoute("/dashboard/testimonials/create")({
  component: () => <TestimonialForm mode="create" />,
});
