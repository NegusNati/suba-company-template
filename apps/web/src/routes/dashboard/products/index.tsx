import { createFileRoute } from "@tanstack/react-router";

import { fetchProducts } from "@/features/dashboard/products/lib/products-api";
import { productKeys } from "@/features/dashboard/products/lib/products-query";
import {
  normalizeProductsListParams,
  productsListParamsSchema,
} from "@/features/dashboard/products/lib/products-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/products/")({
  validateSearch: (search: Record<string, unknown>) =>
    productsListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const params = normalizeProductsListParams(deps);
    await prefetchResource(queryClient, productKeys.list(params), () =>
      fetchProducts(params),
    );
    return null;
  },
});
