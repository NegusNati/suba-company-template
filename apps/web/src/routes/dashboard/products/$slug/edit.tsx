import { createFileRoute } from "@tanstack/react-router";

import { fetchProductById } from "@/features/dashboard/products/lib/products-api";
import { productKeys } from "@/features/dashboard/products/lib/products-query";
import { prefetchResource } from "@/lib/prefetch";
import { fetchPublicProductBySlug } from "@/lib/products/products-api";
import { parseSearchId, resolvePrefetchedSlugId } from "@/lib/route-loader";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/products/$slug/edit")({
  validateSearch: parseSearchId,
  loader: async ({
    search = {},
    params,
  }: {
    search?: Record<string, unknown>;
    params: { slug: string };
  }) => {
    const id = await resolvePrefetchedSlugId({
      rawId: search.id,
      slug: params.slug,
      fetchBySlug: fetchPublicProductBySlug,
      getIdFromSlugResponse: (response) => response?.data?.id,
      prefetchById: (resolvedId) =>
        prefetchResource(queryClient, productKeys.detail(resolvedId), () =>
          fetchProductById(resolvedId),
        ),
      missingIdMessage:
        "Missing product identifier. Please navigate from the products list.",
    });
    return { id };
  },
});
