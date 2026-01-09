import { createFileRoute } from "@tanstack/react-router";

import Vacancies from "@/features/dashboard/vacancies";
import { vacanciesListParamsSchema } from "@/features/dashboard/vacancies/lib/vacancies-schema";

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
  component: Vacancies,
});
