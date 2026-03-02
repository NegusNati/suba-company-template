import { createLazyFileRoute } from "@tanstack/react-router";

import { About } from "@/features/about";

export const Route = createLazyFileRoute("/demo/about")({
  component: AboutPage,
});

function AboutPage() {
  return <About />;
}
