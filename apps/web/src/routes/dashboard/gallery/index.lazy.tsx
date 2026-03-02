import { createLazyFileRoute } from "@tanstack/react-router";

import Gallery from "@/features/dashboard/gallery";

export const Route = createLazyFileRoute("/dashboard/gallery/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Gallery />;
}
