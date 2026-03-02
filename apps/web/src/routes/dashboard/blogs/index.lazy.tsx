import { createLazyFileRoute } from "@tanstack/react-router";

import Blogs from "@/features/dashboard/blogs";

export const Route = createLazyFileRoute("/dashboard/blogs/")({
  component: Blogs,
});
