import { createFileRoute } from "@tanstack/react-router";

import { fetchServices } from "@/features/dashboard/services/lib/services-api";
import { serviceKeys } from "@/features/dashboard/services/lib/services-query";
import {
  normalizeServicesListParams,
  servicesListParamsSchema,
} from "@/features/dashboard/services/lib/services-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

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
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const params = normalizeServicesListParams(deps);
    await prefetchResource(queryClient, serviceKeys.list(params), () =>
      fetchServices(params),
    );
    return null;
  },
});
