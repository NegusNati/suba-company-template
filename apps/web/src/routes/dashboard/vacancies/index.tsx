import { createFileRoute } from "@tanstack/react-router";

import { fetchVacancies } from "@/features/dashboard/vacancies/lib/vacancies-api";
import { vacancyKeys } from "@/features/dashboard/vacancies/lib/vacancies-query";
import {
  normalizeVacanciesListParams,
  vacanciesListParamsSchema,
} from "@/features/dashboard/vacancies/lib/vacancies-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/vacancies/")({
  validateSearch: (search: Record<string, unknown> = {}) =>
    vacanciesListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
      status: typeof search.status === "string" ? search.status : undefined,
    }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const params = normalizeVacanciesListParams(deps);
    await prefetchResource(queryClient, vacancyKeys.list(params), () =>
      fetchVacancies(params),
    );
    return null;
  },
});
