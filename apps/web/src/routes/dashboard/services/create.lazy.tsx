import { createLazyFileRoute } from "@tanstack/react-router";

import ServiceCreate from "@/features/dashboard/services/detail/ServiceCreate";

export const Route = createLazyFileRoute("/dashboard/services/create")({
  component: ServiceCreate,
});
