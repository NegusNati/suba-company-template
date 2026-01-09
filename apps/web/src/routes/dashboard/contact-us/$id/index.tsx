import { createFileRoute } from "@tanstack/react-router";

import ContactView from "@/features/dashboard/contact-us/detail/ContactView";
import { fetchContactById } from "@/features/dashboard/contact-us/lib/contact-api";
import { contactKeys } from "@/features/dashboard/contact-us/lib/contact-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/contact-us/$id/")({
  loader: async ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(
        "Missing contact id. Please navigate from the contact list.",
      );
    }

    await prefetchResource(queryClient, contactKeys.detail(id), () =>
      fetchContactById(id),
    );

    return { id };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData() as { id?: number } | undefined;

  if (!data?.id) {
    return (
      <div className="p-8 text-destructive">
        Unable to load contact. Please return to the list and try again.
      </div>
    );
  }

  return <ContactView contactId={data.id} />;
}
