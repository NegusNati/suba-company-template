import { createFileRoute } from "@tanstack/react-router";

import { ServiceDetailPage } from "@/features/services";
import { getServiceOgImageUrl, SITE_METADATA } from "@/lib/og-utils";
import {
  publicServiceBySlugQueryOptions,
  usePublicServiceBySlug,
} from "@/lib/services";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/services/$slug")({
  component: ServiceDetailPageRoute,
  loader: async ({ params }: { params: Record<string, string> }) => {
    // Prefetch service detail data
    const result = await queryClient.ensureQueryData(
      publicServiceBySlugQueryOptions(params.slug),
    );

    return { service: result?.data };
  },
  head: ({ loaderData, params }) => {
    const service = loaderData?.service;
    const title = service?.title
      ? `${service.title} | Services | ${SITE_METADATA.siteName}`
      : `Services | ${SITE_METADATA.siteName}`;
    // Use description since service doesn't have excerpt
    const description =
      service?.description || SITE_METADATA.defaultDescription;
    const ogImage = params.slug
      ? getServiceOgImageUrl(params.slug)
      : `${SITE_METADATA.siteUrl}/og_image.webp`;
    const url = params.slug
      ? `${SITE_METADATA.siteUrl}/services/${params.slug}`
      : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // Open Graph
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE_METADATA.siteName },
        ...(url ? [{ property: "og:url", content: url }] : []),
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
});

function ServiceDetailPageRoute() {
  const { slug } = Route.useParams();
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
