import { createFileRoute } from "@tanstack/react-router";

import { WorkSamplesPage } from "@/features/work-samples";

export const Route = createFileRoute("/demo/projects/")({
  component: WorkSamplesRoute,
});

function WorkSamplesRoute() {
  return <WorkSamplesPage />;
}
