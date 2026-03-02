import { createLazyFileRoute } from "@tanstack/react-router";

import Vacancies from "@/features/dashboard/vacancies";

export const Route = createLazyFileRoute("/dashboard/vacancies/")({
  component: Vacancies,
});
