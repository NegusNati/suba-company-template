import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/dashboard/contact-us/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>create contact</div>;
}
