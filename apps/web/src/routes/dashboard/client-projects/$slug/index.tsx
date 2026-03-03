import { createFileRoute } from "@tanstack/react-router";

import { fetchClientProjectById } from "@/features/dashboard/client-projects/lib/client-projects-api";
import { clientProjectKeys } from "@/features/dashboard/client-projects/lib/client-projects-query";
import { fetchPublicCaseStudyBySlug } from "@/lib/case-study/case-study-api";
import { prefetchResource } from "@/lib/prefetch";
import { parseSearchId, resolvePrefetchedSlugId } from "@/lib/route-loader";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/client-projects/$slug/")({
  validateSearch: parseSearchId,
  loader: async ({
    search = {},
    params,
  }: {
    search?: Record<string, unknown>;
    params: { slug: string };
  }) => {
    const id = await resolvePrefetchedSlugId({
      rawId: search.id,
      slug: params.slug,
      fetchBySlug: fetchPublicCaseStudyBySlug,
      getIdFromSlugResponse: (response) => response?.data?.id,
      prefetchById: (resolvedId) =>
        prefetchResource(
          queryClient,
          clientProjectKeys.detail(resolvedId),
          () => fetchClientProjectById(resolvedId),
        ),
      missingIdMessage:
        "Missing client project identifier. Please navigate from the client projects list.",
    });
    return { id };
  },
});
