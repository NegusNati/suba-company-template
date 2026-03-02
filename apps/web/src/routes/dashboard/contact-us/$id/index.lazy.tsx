import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ContactView from "@/features/dashboard/contact-us/detail/ContactView";

const routeApi = getRouteApi("/dashboard/contact-us/$id/");

export const Route = createLazyFileRoute("/dashboard/contact-us/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const data = routeApi.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load contact. Please return to the list and try again.
      </div>
    );
  }

  return <ContactView contactId={data.id} />;
}
