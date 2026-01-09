import { createFileRoute } from "@tanstack/react-router";

import { CareersPage } from "@/features/careers";

export const Route = createFileRoute("/demo/careers/")({
  component: CareersRoute,
});

function CareersRoute() {
  return <CareersPage />;
}
