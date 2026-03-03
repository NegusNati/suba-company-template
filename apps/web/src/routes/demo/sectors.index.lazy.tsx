import { createLazyFileRoute } from "@tanstack/react-router";

import { SectorsPage } from "@/features/sectors";

export const Route = createLazyFileRoute("/demo/sectors/")({
  component: SectorsRoute,
});

function SectorsRoute() {
  return <SectorsPage />;
}
