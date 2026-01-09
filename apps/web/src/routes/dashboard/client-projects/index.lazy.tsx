import { createLazyFileRoute } from "@tanstack/react-router";

import ClientProjects from "@/features/dashboard/client-projects";
import { fetchClientProjects } from "@/features/dashboard/client-projects/lib/client-projects-api";
import { clientProjectKeys } from "@/features/dashboard/client-projects/lib/client-projects-query";
import {
  clientProjectsListParamsSchema,
  normalizeClientProjectsListParams,
} from "@/features/dashboard/client-projects/lib/client-projects-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/client-projects/")({
  validateSearch: (search: Record<string, unknown>) =>
    clientProjectsListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
  loader: async ({ search }: { search: Record<string, unknown> }) => {
    const params = normalizeClientProjectsListParams(search);
    await prefetchResource(queryClient, clientProjectKeys.list(params), () =>
      fetchClientProjects(params),
    );
    return null;
  },
  component: ClientProjects,
});
