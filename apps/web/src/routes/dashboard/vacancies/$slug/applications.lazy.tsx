import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import { VacancyApplications } from "@/features/dashboard/vacancies/applications/VacancyApplications";
import type { VacancyApplicationsListParams } from "@/features/dashboard/vacancies/lib/vacancies-schema";

const routeApi = getRouteApi("/dashboard/vacancies/$slug/applications");

export const Route = createLazyFileRoute(
  "/dashboard/vacancies/$slug/applications",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = routeApi.useParams();
  const data = routeApi.useLoaderData() as { id?: number } | undefined;
  const search = routeApi.useSearch() as {
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
