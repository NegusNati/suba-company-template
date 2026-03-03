import { createFileRoute } from "@tanstack/react-router";

import { publicBusinessSectorsQueryOptions } from "@/lib/business-sectors";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/sectors/")({
  loader: async () => {
    await queryClient.ensureQueryData(
      publicBusinessSectorsQueryOptions({
        limit: 50,
        sortBy: "title",
        sortOrder: "asc",
      }),
    );

    return null;
  },
});
