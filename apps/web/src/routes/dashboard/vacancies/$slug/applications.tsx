import { createFileRoute } from "@tanstack/react-router";

import { VacancyApplications } from "@/features/dashboard/vacancies/applications/VacancyApplications";
import {
  fetchVacancyById,
  fetchVacancyBySlug,
  type VacancyResponse,
} from "@/features/dashboard/vacancies/lib/vacancies-api";
import { vacancyKeys } from "@/features/dashboard/vacancies/lib/vacancies-query";
import { vacancyApplicationsListParamsSchema } from "@/features/dashboard/vacancies/lib/vacancies-schema";
import type { VacancyApplicationsListParams } from "@/features/dashboard/vacancies/lib/vacancies-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/vacancies/$slug/applications")(
  {
    validateSearch: (search: Record<string, unknown> = {}) => {
      const rawId = search.id;
      const id =
        typeof rawId === "number" ? rawId : rawId ? Number(rawId) : undefined;

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

      return { id, ...listParams };
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
        queryClient.setQueryData(
          vacancyKeys.detail(vacancyId),
          vacancyResponse,
        );
      }

      return { id: vacancyId };
    },
    component: RouteComponent,
  },
);

function RouteComponent() {
  const { slug } = Route.useParams();
  const data = Route.useLoaderData() as { id?: number } | undefined;
  const search = Route.useSearch() as {
    id?: number;
  } & Partial<VacancyApplicationsListParams>;

  if (!data?.id) {
    return (
      <div className="p-6 text-destructive">
        Unable to load applications. Please return to the list and try again.
      </div>
    );
  }

  const { id: _ignored, ...listParams } = search;

  return (
    <VacancyApplications vacancyId={data.id} slug={slug} search={listParams} />
  );
}
