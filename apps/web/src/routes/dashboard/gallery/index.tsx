import { createFileRoute } from "@tanstack/react-router";

import { fetchGalleryItems } from "@/features/dashboard/gallery/lib/gallery-api";
import { galleryKeys } from "@/features/dashboard/gallery/lib/gallery-query";
import {
  galleryListParamsSchema,
  normalizeGalleryListParams,
} from "@/features/dashboard/gallery/lib/gallery-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/gallery/")({
  validateSearch: (search: Record<string, unknown>) =>
    galleryListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const params = normalizeGalleryListParams(deps);
    await prefetchResource(queryClient, galleryKeys.list(params), () =>
      fetchGalleryItems(params),
    );
    return null;
  },
});
