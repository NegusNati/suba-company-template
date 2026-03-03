import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import { SectorDetailPage } from "@/features/sectors";
import { usePublicBusinessSectorBySlug } from "@/lib/business-sectors";

const routeApi = getRouteApi("/demo/sectors/$slug");

export const Route = createLazyFileRoute("/demo/sectors/$slug")({
  component: SectorDetailRoute,
});

function SectorDetailRoute() {
  const { slug } = routeApi.useParams();
  const { data, isLoading, isError } = usePublicBusinessSectorBySlug(slug);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background pb-20">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center text-muted-foreground">
          Loading sector...
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="w-full min-h-screen bg-background pb-20">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center text-destructive">
          Failed to load sector.
        </div>
      </div>
    );
  }

  return <SectorDetailPage sector={data.data} />;
}
