import { createFileRoute } from "@tanstack/react-router";

import ServiceView from "@/features/dashboard/services/detail/ServiceView";
import { fetchServiceById } from "@/features/dashboard/services/lib/services-api";
import { serviceKeys } from "@/features/dashboard/services/lib/services-query";
import { prefetchResource } from "@/lib/prefetch";
import { fetchPublicServiceBySlug } from "@/lib/services";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/services/$slug/")({
  validateSearch: (search: Record<string, unknown> = {}) => {
    const rawId = search.id;
    const id =
      typeof rawId === "number" ? rawId : rawId ? Number(rawId) : undefined;
    return { id };
  },
  loader: async ({
    params,
    search = {},
  }: {
    params: { slug: string };
    search?: { id?: number };
  }) => {
    const rawId = search.id;
    let id = typeof rawId === "number" ? rawId : rawId ? Number(rawId) : NaN;

    if (!id || Number.isNaN(id)) {
      const detail = await fetchPublicServiceBySlug(params.slug);
      id = detail.data.id;
    }

    await prefetchResource(queryClient, serviceKeys.detail(id), () =>
      fetchServiceById(id, { includeImages: true }),
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
        Unable to load service. Please return to the list and try again.
      </div>
    );
  }

  return <ServiceView serviceId={data.id} />;
}
