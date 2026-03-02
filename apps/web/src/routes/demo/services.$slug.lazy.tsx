import { createLazyFileRoute, getRouteApi } from "@tanstack/react-router";

import { ServiceDetailPage } from "@/features/services";
import { usePublicServiceBySlug } from "@/lib/services/services-query";

const routeApi = getRouteApi("/demo/services/$slug");

export const Route = createLazyFileRoute("/demo/services/$slug")({
  component: ServiceDetailPageRoute,
});

function ServiceDetailPageRoute() {
  const { slug } = routeApi.useParams();
  const { data, isLoading, isError } = usePublicServiceBySlug(slug);

  if (isLoading) {
    return (
      <div className="w-full bg-white min-h-screen pb-20">
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading service...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full bg-white min-h-screen pb-20">
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Failed to load service. Please try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ServiceDetailPage service={data.data} />;
}
