import { createFileRoute } from "@tanstack/react-router";

import { publicCaseStudiesQueryOptions } from "@/lib/case-study/case-study-query";
import { faqListQueryOptions } from "@/lib/faq/faq-query";
import { getDefaultOgImageUrl, SITE_METADATA } from "@/lib/og-utils";
import { clientPartnersQueryOptions } from "@/lib/partners";
import { testimonialListQueryOptions } from "@/lib/testimonial/testimonial-query";
import { queryClient } from "@/main";

export const Route = createFileRoute("/demo/")({
  loader: async () => {
    // Prefetch data for the home page
    await Promise.all([
      queryClient.ensureQueryData(clientPartnersQueryOptions()),
      queryClient.ensureQueryData(testimonialListQueryOptions({ limit: 5 })),
      queryClient.ensureQueryData(faqListQueryOptions({ limit: 10 })),
      queryClient.ensureQueryData(publicCaseStudiesQueryOptions({ limit: 6 })),
    ]);
  },
  head: () => ({
    meta: [
      { title: SITE_METADATA.defaultTitle },
      { name: "description", content: SITE_METADATA.defaultDescription },
      // Open Graph
      { property: "og:title", content: SITE_METADATA.defaultTitle },
      { property: "og:description", content: SITE_METADATA.defaultDescription },
      { property: "og:image", content: getDefaultOgImageUrl() },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_METADATA.siteName },
      { property: "og:url", content: SITE_METADATA.siteUrl },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_METADATA.defaultTitle },
      {
        name: "twitter:description",
        content: SITE_METADATA.defaultDescription,
      },
      { name: "twitter:image", content: getDefaultOgImageUrl() },
    ],
  }),
});
