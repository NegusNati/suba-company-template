import { createFileRoute } from "@tanstack/react-router";

import PartnerEdit from "@/features/dashboard/partners/detail/PartnerEdit";
import { fetchPartnerById } from "@/features/dashboard/partners/lib/partners-api";
import { partnerKeys } from "@/features/dashboard/partners/lib/partners-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/partners/$id/edit")({
  loader: async ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(
        "Missing partner id. Please navigate from the partners list.",
      );
    }

    await prefetchResource(queryClient, partnerKeys.detail(id), () =>
      fetchPartnerById(id),
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
        Unable to load partner. Please return to the list and try again.
      </div>
    );
  }

  return <PartnerEdit partnerId={data.id} />;
}
