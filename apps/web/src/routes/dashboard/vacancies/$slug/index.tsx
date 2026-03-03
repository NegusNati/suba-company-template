import { createFileRoute } from "@tanstack/react-router";

import {
  fetchVacancyById,
  fetchVacancyBySlug,
} from "@/features/dashboard/vacancies/lib/vacancies-api";
import { vacancyKeys } from "@/features/dashboard/vacancies/lib/vacancies-query";
import { prefetchResource } from "@/lib/prefetch";
import { parseSearchId, resolvePrefetchedSlugId } from "@/lib/route-loader";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/vacancies/$slug/")({
  validateSearch: parseSearchId,
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
});
