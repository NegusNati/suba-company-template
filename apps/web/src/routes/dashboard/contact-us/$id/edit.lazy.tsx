import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import ContactEdit from "@/features/dashboard/contact-us/detail/ContactEdit";

const routeApi = getRouteApi("/dashboard/contact-us/$id/edit");

export const Route = createLazyFileRoute("/dashboard/contact-us/$id/edit")({
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

  return <ContactEdit contactId={data.id} />;
}
