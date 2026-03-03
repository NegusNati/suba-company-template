import { createFileRoute } from "@tanstack/react-router";

import {
  fetchVacancyById,
  fetchVacancyBySlug,
} from "@/features/dashboard/vacancies/lib/vacancies-api";
import { vacancyKeys } from "@/features/dashboard/vacancies/lib/vacancies-query";
import { vacancyApplicationsListParamsSchema } from "@/features/dashboard/vacancies/lib/vacancies-schema";
import { prefetchResource } from "@/lib/prefetch";
import { parseSearchId, resolvePrefetchedSlugId } from "@/lib/route-loader";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/vacancies/$slug/applications")(
  {
    validateSearch: (search: Record<string, unknown> = {}) => {
      const listParams = vacancyApplicationsListParamsSchema.partial().parse({
        page: search.page ? Number(search.page) : undefined,
        limit: search.limit ? Number(search.limit) : undefined,
        search: typeof search.search === "string" ? search.search : undefined,
        sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
        sortOrder:
          search.sortOrder === "asc" || search.sortOrder === "desc"
            ? search.sortOrder
            : undefined,
        status: typeof search.status === "string" ? search.status : undefined,
      });

      return { ...parseSearchId(search), ...listParams };
    },
    loader: async ({
      search = {},
      params,
    }: {
      search?: Record<string, unknown>;
      params: { slug: string };
    }) => {
      const id = await resolvePrefetchedSlugId({
        rawId: search.id,
        slug: params.slug,
        fetchBySlug: (slug) =>
          prefetchResource(queryClient, vacancyKeys.slug(slug), () =>
            fetchVacancyBySlug(slug),
          ),
        getIdFromSlugResponse: (response) => response?.data?.id,
        prefetchById: (resolvedId) =>
          prefetchResource(queryClient, vacancyKeys.detail(resolvedId), () =>
            fetchVacancyById(resolvedId),
          ),
        missingIdMessage:
          "Missing vacancy identifier. Please navigate from the vacancies list.",
      });
      return { id };
    },
  },
);
