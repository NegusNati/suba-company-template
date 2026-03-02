import { createFileRoute } from "@tanstack/react-router";

import { productsListParamsSchema } from "@/features/dashboard/products/lib/products-schema";

export const Route = createFileRoute("/dashboard/products/")({
  validateSearch: (search: Record<string, unknown>) =>
    productsListParamsSchema.partial().parse({
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
