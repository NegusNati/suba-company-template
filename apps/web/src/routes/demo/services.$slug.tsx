import { createFileRoute } from "@tanstack/react-router";

import { getServiceOgImageUrl, SITE_METADATA } from "@/lib/og-utils";
import { publicServiceBySlugQueryOptions } from "@/lib/services/services-query";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/services/$slug")({
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
