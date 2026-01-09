import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/features/about";
import { getPageOgImageUrl, SITE_METADATA } from "@/lib/og-utils";

const PAGE_TITLE = `About Us | ${SITE_METADATA.siteName}`;
const PAGE_DESCRIPTION =
  "Learn about our company - our mission, values, and the team behind innovative software development and IT solutions.";

export const Route = createFileRoute("/demo/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      // Open Graph
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      {
        property: "og:image",
        content: getPageOgImageUrl({
          title: "About Us",
          description: PAGE_DESCRIPTION,
          category: "Company",
        }),
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_METADATA.siteName },
      { property: "og:url", content: `${SITE_METADATA.siteUrl}/about` },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
    ],
  }),
});

function AboutPage() {
  return <About />;
}
