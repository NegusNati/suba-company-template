import { createLazyFileRoute } from "@tanstack/react-router";

import { WorkSamplesPage } from "@/features/work-samples";

export const Route = createLazyFileRoute("/demo/projects/")({
  component: WorkSamplesRoute,
});

function WorkSamplesRoute() {
  return <WorkSamplesPage />;
}
