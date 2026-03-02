import { createLazyFileRoute } from "@tanstack/react-router";

import Services from "@/features/dashboard/services";

export const Route = createLazyFileRoute("/dashboard/services/")({
  component: Services,
});
