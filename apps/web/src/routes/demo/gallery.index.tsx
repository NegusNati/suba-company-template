import { createFileRoute } from "@tanstack/react-router";

import {
  publicGalleryCategoriesQueryOptions,
  publicGalleryQueryOptions,
} from "@/lib/gallery/gallery-query";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/gallery/")({
  loader: async () => {
    await Promise.all([
      queryClient.ensureQueryData(
        publicGalleryCategoriesQueryOptions({
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        }),
      ),
      queryClient.ensureQueryData(
        publicGalleryQueryOptions({
          limit: 100,
          sortBy: "occurredAt",
          sortOrder: "desc",
        }),
      ),
    ]);

    return null;
  },
});
