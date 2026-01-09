import { createFileRoute } from "@tanstack/react-router";

import {
  CaseStudyDetailPage,
  ProductDetailPage,
} from "@/features/work-samples";
import { fetchPublicCaseStudyBySlug } from "@/lib/case-study";
import { getProjectOgImageUrl, SITE_METADATA } from "@/lib/og-utils";
import { fetchPublicProductBySlug } from "@/lib/products";

export const Route = createFileRoute("/demo/projects/$slug")({
  loader: async ({ params }: { params: Record<string, string> }) => {
    // Try to fetch as case study first, then as product
    try {
      const caseStudyData = await fetchPublicCaseStudyBySlug(params.slug);
      if (caseStudyData.data) {
        return { type: "caseStudy" as const, data: caseStudyData.data };
      }
    } catch {
      // Not a case study, try product
    }

    try {
      const productData = await fetchPublicProductBySlug(params.slug);
      if (productData.data) {
        return { type: "product" as const, data: productData.data };
      }
    } catch {
      // Not a product either
    }

    throw new Error("Project not found");
  },
  head: ({ loaderData, params }) => {
    const project = loaderData?.data;
    const title = project?.title
      ? `${project.title} | Projects | ${SITE_METADATA.siteName}`
      : `Projects | ${SITE_METADATA.siteName}`;
    // Use excerpt if available (case studies), fallback to description (products) or default
    const getDescription = (): string => {
      if (project && "excerpt" in project && project.excerpt) {
        return project.excerpt;
      }
      if (project && "description" in project && project.description) {
        return project.description;
      }
      return SITE_METADATA.defaultDescription;
    };
    const description = getDescription();
    const ogImage = params.slug
      ? getProjectOgImageUrl(params.slug)
      : `${SITE_METADATA.siteUrl}/og_image.webp`;
    const url = params.slug
      ? `${SITE_METADATA.siteUrl}/projects/${params.slug}`
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
  component: ProjectDetailRoute,
});

function ProjectDetailRoute() {
  const loaderData = Route.useLoaderData();

  if (loaderData.type === "caseStudy") {
    return <CaseStudyDetailPage caseStudy={loaderData.data} />;
  }

  return <ProductDetailPage product={loaderData.data} />;
}
