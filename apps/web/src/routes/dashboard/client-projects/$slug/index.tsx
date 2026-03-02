import { createFileRoute } from "@tanstack/react-router";

import { fetchClientProjectById } from "@/features/dashboard/client-projects/lib/client-projects-api";
import { clientProjectKeys } from "@/features/dashboard/client-projects/lib/client-projects-query";
import { fetchPublicCaseStudyBySlug } from "@/lib/case-study/case-study-api";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/client-projects/$slug/")({
  validateSearch: (search: Record<string, unknown> = {}) => {
    const rawId = search.id;
    const id =
      typeof rawId === "number" ? rawId : rawId ? Number(rawId) : undefined;
    return { id };
  },
  loader: async ({
    search = {},
    params,
  }: {
    search?: { id?: number };
    params: { slug: string };
  }) => {
    const slug = params.slug;

    const idFromSearch =
      typeof search.id === "number"
        ? search.id
        : search.id
          ? Number(search.id)
          : undefined;

    let clientProjectId = idFromSearch;

    if (idFromSearch) {
      await prefetchResource(
        queryClient,
        clientProjectKeys.detail(idFromSearch),
        () => fetchClientProjectById(idFromSearch),
      );
    } else {
      const slugResponse = await fetchPublicCaseStudyBySlug(slug);
      clientProjectId = slugResponse?.data?.id;

      if (clientProjectId) {
        await prefetchResource(
          queryClient,
          clientProjectKeys.detail(clientProjectId),
          () => fetchClientProjectById(clientProjectId!),
        );
      }
    }

    if (!clientProjectId || Number.isNaN(clientProjectId)) {
      throw new Error(
        "Missing client project identifier. Please navigate from the client projects list.",
      );
    }

    return { id: clientProjectId };
  },
});
