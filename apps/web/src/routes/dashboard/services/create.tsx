import { createFileRoute } from "@tanstack/react-router";

import ServiceCreate from "@/features/dashboard/services/detail/ServiceCreate";

export const Route = createFileRoute("/dashboard/services/create")({
  component: ServiceCreate,
});
