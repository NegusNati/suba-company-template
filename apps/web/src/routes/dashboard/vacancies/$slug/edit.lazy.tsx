import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import VacancyDetail from "@/features/dashboard/vacancies/detail/VacancyDetail";

const routeApi = getRouteApi("/dashboard/vacancies/$slug/edit");

export const Route = createLazyFileRoute("/dashboard/vacancies/$slug/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-6 text-destructive">
        Unable to load vacancy. Please return to the list and try again.
      </div>
    );
  }

  return <VacancyDetail vacancyId={data.id} mode="edit" />;
}
