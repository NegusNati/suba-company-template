import { createFileRoute } from "@tanstack/react-router";

import Services from "@/features/dashboard/services";
import { servicesListParamsSchema } from "@/features/dashboard/services/lib/services-schema";

export const Route = createFileRoute("/dashboard/services/")({
  validateSearch: (search: Record<string, unknown>) =>
    servicesListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
  component: Services,
});
