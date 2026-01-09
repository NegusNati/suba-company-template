import { createFileRoute } from "@tanstack/react-router";

import { SITE } from "@/config/template";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} - Open Source Company Website Template` },
      {
        name: "description",
        content:
          "A production-ready, full-stack company website template with React, Hono, and PostgreSQL. Includes CMS dashboard, blog, careers, projects, and more.",
      },
      // Open Graph
      {
        property: "og:title",
        content: `${SITE.name} - Open Source Company Website Template`,
      },
      {
        property: "og:description",
        content:
          "A production-ready, full-stack company website template with React, Hono, and PostgreSQL. Includes CMS dashboard, blog, careers, projects, and more.",
      },
      { property: "og:type", content: "website" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: `${SITE.name} - Open Source Company Website Template`,
      },
      {
        name: "twitter:description",
        content:
          "A production-ready, full-stack company website template with React, Hono, and PostgreSQL.",
      },
    ],
  }),
});
