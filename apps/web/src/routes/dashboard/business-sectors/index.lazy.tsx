import { createLazyFileRoute } from "@tanstack/react-router";

import BusinessSectors from "@/features/dashboard/business-sectors";

export const Route = createLazyFileRoute("/dashboard/business-sectors/")({
  component: BusinessSectors,
});
