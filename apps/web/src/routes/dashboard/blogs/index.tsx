import { createFileRoute } from "@tanstack/react-router";

import Blogs from "@/features/dashboard/blogs";
import { blogsListParamsSchema } from "@/features/dashboard/blogs/lib/blogs-schema";

export const Route = createFileRoute("/dashboard/blogs/")({
  validateSearch: (search: Record<string, unknown> = {}) =>
    blogsListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
  component: Blogs,
});
