import { createLazyFileRoute } from "@tanstack/react-router";

import SectorCreate from "@/features/dashboard/business-sectors/detail/SectorCreate";

export const Route = createLazyFileRoute("/dashboard/business-sectors/create")({
  component: SectorCreate,
});
