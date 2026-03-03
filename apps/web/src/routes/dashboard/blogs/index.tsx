import { createFileRoute } from "@tanstack/react-router";

import { fetchBlogs } from "@/features/dashboard/blogs/lib/blogs-api";
import { blogKeys } from "@/features/dashboard/blogs/lib/blogs-query";
import {
  blogsListParamsSchema,
  normalizeBlogsListParams,
} from "@/features/dashboard/blogs/lib/blogs-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

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
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const params = normalizeBlogsListParams(deps);
    await prefetchResource(queryClient, blogKeys.list(params), () =>
      fetchBlogs(params),
    );
    return null;
  },
});
