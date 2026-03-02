import { createFileRoute } from "@tanstack/react-router";

import { publicServicesQueryOptions } from "@/lib/services/services-query";
import { publicTagsQueryOptions } from "@/lib/tags/tags-query";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/services/")({
  loader: async () => {
    await Promise.all([
      queryClient.ensureQueryData(publicTagsQueryOptions({ limit: 50 })),
      queryClient.ensureQueryData(publicServicesQueryOptions({ limit: 50 })),
    ]);

    return null;
  },
});
