import { createFileRoute } from "@tanstack/react-router";

import { Contact } from "@/features/contact";
import { getPageOgImageUrl, SITE_METADATA } from "@/lib/og-utils";

const PAGE_TITLE = `Contact Us | ${SITE_METADATA.siteName}`;
const PAGE_DESCRIPTION =
  "Get in touch with us. We'd love to hear about your project and discuss how we can help bring your ideas to life.";

export const Route = createFileRoute("/demo/contact")({
  component: ContactPage,
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
          title: "Contact Us",
          description: PAGE_DESCRIPTION,
          category: "Contact",
        }),
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_METADATA.siteName },
      { property: "og:url", content: `${SITE_METADATA.siteUrl}/contact` },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
    ],
  }),
});

function ContactPage() {
  return <Contact />;
}
