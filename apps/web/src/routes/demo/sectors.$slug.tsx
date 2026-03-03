import { createFileRoute } from "@tanstack/react-router";

import {
  publicBusinessSectorDetailQueryOptions,
  publicBusinessSectorsQueryOptions,
} from "@/lib/business-sectors";
import { getPageOgImageUrl, SITE_METADATA } from "@/lib/og-utils";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/sectors/$slug")({
  loader: async ({ params }: { params: Record<string, string> }) => {
    const [sector] = await Promise.all([
      queryClient.ensureQueryData(
        publicBusinessSectorDetailQueryOptions(params.slug),
      ),
      queryClient.ensureQueryData(
        publicBusinessSectorsQueryOptions({
          limit: 50,
          sortBy: "title",
          sortOrder: "asc",
        }),
      ),
    ]);

    return { sector: sector?.data };
  },
  head: ({ loaderData, params }) => {
    const sector = loaderData?.sector;
    const title = sector?.title
      ? `${sector.title} | Business Sectors | ${SITE_METADATA.siteName}`
      : `Business Sectors | ${SITE_METADATA.siteName}`;
    const description = sector?.excerpt || SITE_METADATA.defaultDescription;

    const ogImage = getPageOgImageUrl({
      title: sector?.title ?? "Business Sectors",
      description,
      category: "Business Sectors",
      image: sector?.featuredImageUrl ?? undefined,
    });

    const url = params.slug
      ? `${SITE_METADATA.siteUrl}/sectors/${params.slug}`
      : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE_METADATA.siteName },
        ...(url ? [{ property: "og:url", content: url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
});
