import { createFileRoute } from "@tanstack/react-router";

import { fetchServiceById } from "@/features/dashboard/services/lib/services-api";
import { serviceKeys } from "@/features/dashboard/services/lib/services-query";
import { prefetchResource } from "@/lib/prefetch";
import { parseSearchId, resolvePrefetchedSlugId } from "@/lib/route-loader";
import { fetchPublicServiceBySlug } from "@/lib/services/services-api";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/services/$slug/edit")({
  validateSearch: parseSearchId,
  loader: async ({
    params,
    search = {},
  }: {
    params: { slug: string };
    search?: Record<string, unknown>;
  }) => {
    const id = await resolvePrefetchedSlugId({
      rawId: search.id,
      slug: params.slug,
      fetchBySlug: fetchPublicServiceBySlug,
      getIdFromSlugResponse: (response) => response?.data?.id,
      prefetchById: (resolvedId) =>
        prefetchResource(queryClient, serviceKeys.detail(resolvedId), () =>
          fetchServiceById(resolvedId, { includeImages: true }),
        ),
      missingIdMessage:
        "Missing service identifier. Please navigate from the services list.",
    });
    return { id };
  },
});
