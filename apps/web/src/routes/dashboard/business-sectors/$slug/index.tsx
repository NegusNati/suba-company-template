import { createFileRoute } from "@tanstack/react-router";

import {
  fetchBusinessSectorById,
  fetchBusinessSectorBySlug,
} from "@/features/dashboard/business-sectors/lib/business-sectors-api";
import { businessSectorKeys } from "@/features/dashboard/business-sectors/lib/business-sectors-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/business-sectors/$slug/")({
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
      const detail = await fetchBusinessSectorBySlug(params.slug);
      id = detail.data.id;
    }

    await prefetchResource(queryClient, businessSectorKeys.detail(id), () =>
      fetchBusinessSectorById(id),
    );

    return { id };
  },
});
