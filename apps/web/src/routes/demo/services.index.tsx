import { createFileRoute } from "@tanstack/react-router";

import { Services } from "@/features/services";
import { publicServicesQueryOptions } from "@/lib/services";
import { publicTagsQueryOptions } from "@/lib/tags";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/services/")({
  component: ServicesPage,
  loader: async () => {
    // Prefetch tags for category filter
    await queryClient.ensureQueryData(publicTagsQueryOptions({ limit: 50 }));

    // Prefetch services
    await queryClient.ensureQueryData(
      publicServicesQueryOptions({ limit: 50 }),
    );

    return null;
  },
});

function ServicesPage() {
  return <Services />;
}
