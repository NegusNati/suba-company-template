import { createLazyFileRoute } from "@tanstack/react-router";

import { Contact } from "@/features/contact";

export const Route = createLazyFileRoute("/demo/contact")({
  component: ContactPage,
});

function ContactPage() {
  return <Contact />;
}
