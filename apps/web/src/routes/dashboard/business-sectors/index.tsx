import { createFileRoute } from "@tanstack/react-router";

import { businessSectorListParamsSchema } from "@/features/dashboard/business-sectors/lib/business-sectors-schema";

export const Route = createFileRoute("/dashboard/business-sectors/")({
  validateSearch: (search: Record<string, unknown>) =>
    businessSectorListParamsSchema.partial().parse({
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
