import { createFileRoute } from "@tanstack/react-router";

import { fetchPublicVacancyBySlug } from "@/features/careers/lib/careers-api";
import { getCareerOgImageUrl, SITE_METADATA } from "@/lib/og-utils";

export const Route = createFileRoute("/demo/careers/$slug")({
  loader: async ({ params }: { params: Record<string, string> }) => {
    const data = await fetchPublicVacancyBySlug(params.slug);
    return { vacancy: data.data };
  },
  head: ({ loaderData, params }) => {
    const vacancy = loaderData?.vacancy;
    const title = vacancy?.title
      ? `${vacancy.title} | Careers | ${SITE_METADATA.siteName}`
      : `Careers | ${SITE_METADATA.siteName}`;
    const description = vacancy?.excerpt || SITE_METADATA.defaultDescription;
    const ogImage = params.slug
      ? getCareerOgImageUrl(params.slug)
      : `${SITE_METADATA.siteUrl}/og_image.webp`;
    const url = params.slug
      ? `${SITE_METADATA.siteUrl}/careers/${params.slug}`
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
