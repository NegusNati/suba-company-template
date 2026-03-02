import { createFileRoute } from "@tanstack/react-router";

import {
  fetchVacancyById,
  fetchVacancyBySlug,
  type VacancyResponse,
} from "@/features/dashboard/vacancies/lib/vacancies-api";
import { vacancyKeys } from "@/features/dashboard/vacancies/lib/vacancies-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/vacancies/$slug/edit")({
  validateSearch: (search: Record<string, unknown> = {}) => {
    const rawId = search.id;
    const id =
      typeof rawId === "number" ? rawId : rawId ? Number(rawId) : undefined;
    return { id };
  },
  loader: async ({
    search = {},
    params,
  }: {
    search?: { id?: number };
    params: { slug: string };
  }) => {
    const slug = params.slug;
    const idFromSearch =
      typeof search.id === "number"
        ? search.id
        : search.id
          ? Number(search.id)
          : undefined;

    let vacancyResponse: VacancyResponse | undefined;
    let vacancyId = idFromSearch;

    if (idFromSearch) {
      vacancyResponse = await prefetchResource(
        queryClient,
        vacancyKeys.detail(idFromSearch),
        () => fetchVacancyById(idFromSearch),
      );
    } else {
      const slugResponse = await prefetchResource(
        queryClient,
        vacancyKeys.slug(slug),
        () => fetchVacancyBySlug(slug),
      );

      vacancyId = slugResponse?.data?.id;

      if (vacancyId) {
        vacancyResponse = await prefetchResource(
          queryClient,
          vacancyKeys.detail(vacancyId),
          () => fetchVacancyById(vacancyId!),
        );
      }
    }

    if (!vacancyId || Number.isNaN(vacancyId)) {
      throw new Error(
        "Missing vacancy identifier. Please navigate from the vacancies list.",
      );
    }

    if (vacancyResponse) {
      queryClient.setQueryData(vacancyKeys.detail(vacancyId), vacancyResponse);
    }

    return { id: vacancyId };
  },
});
