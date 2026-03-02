import { createLazyFileRoute } from "@tanstack/react-router";

import { Services } from "@/features/services";

export const Route = createLazyFileRoute("/demo/services/")({
  component: ServicesPage,
});

function ServicesPage() {
  return <Services />;
}
