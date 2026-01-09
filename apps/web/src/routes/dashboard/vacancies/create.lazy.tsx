import { createLazyFileRoute } from "@tanstack/react-router";

import VacancyCreate from "@/features/dashboard/vacancies/detail/VacancyCreate";

export const Route = createLazyFileRoute("/dashboard/vacancies/create")({
  component: VacancyCreate,
});
