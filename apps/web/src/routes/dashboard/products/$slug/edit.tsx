import { createFileRoute } from "@tanstack/react-router";

import { fetchProductById } from "@/features/dashboard/products/lib/products-api";
import { productKeys } from "@/features/dashboard/products/lib/products-query";
import { prefetchResource } from "@/lib/prefetch";
import { fetchPublicProductBySlug } from "@/lib/products/products-api";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/products/$slug/edit")({
  validateSearch: (search: Record<string, unknown> = {}) => {
    const rawId = search.id;
    const id =
      typeof rawId === "number" ? rawId : rawId ? Number(rawId) : undefined;
    return { id };
  },
  loader: async ({
    search = {},
    params,
  }: {
    search?: { id?: number };
    params: { slug: string };
  }) => {
    const slug = params.slug;
    const idFromSearch =
      typeof search.id === "number"
        ? search.id
        : search.id
          ? Number(search.id)
          : undefined;

    let productId = idFromSearch;

    if (idFromSearch) {
      // Fast path when we already have the id from the list navigation.
      await prefetchResource(
        queryClient,
        productKeys.detail(idFromSearch),
        () => fetchProductById(idFromSearch),
      );
    } else {
      // Derive the id from the slug to support direct deep links.
      const slugResponse = await fetchPublicProductBySlug(slug);
      productId = slugResponse?.data?.id;

      if (productId) {
        await prefetchResource(queryClient, productKeys.detail(productId), () =>
          fetchProductById(productId!),
        );
      }
    }

    if (!productId || Number.isNaN(productId)) {
      throw new Error(
        "Missing product id. Please navigate from the products list.",
      );
    }

    return { id: productId };
  },
});
