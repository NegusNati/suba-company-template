import { createLazyFileRoute } from "@tanstack/react-router";

import BlogCreate from "@/features/dashboard/blogs/detail/BlogCreate";

export const Route = createLazyFileRoute("/dashboard/blogs/create")({
  component: BlogCreate,
});
