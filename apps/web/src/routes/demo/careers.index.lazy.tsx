import { createLazyFileRoute } from "@tanstack/react-router";

import { CareersPage } from "@/features/careers";

export const Route = createLazyFileRoute("/demo/careers/")({
  component: CareersRoute,
});

function CareersRoute() {
  return <CareersPage />;
}
