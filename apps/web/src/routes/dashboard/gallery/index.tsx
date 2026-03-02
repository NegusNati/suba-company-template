import { createFileRoute } from "@tanstack/react-router";

import { galleryListParamsSchema } from "@/features/dashboard/gallery/lib/gallery-schema";

export const Route = createFileRoute("/dashboard/gallery/")({
  validateSearch: (search: Record<string, unknown>) =>
    galleryListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
});
