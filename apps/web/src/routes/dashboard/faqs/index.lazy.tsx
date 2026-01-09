import { createLazyFileRoute } from "@tanstack/react-router";

import FAQS from "@/features/dashboard/faqs";
import { fetchFaqs } from "@/features/dashboard/faqs/lib/faqs-api";
import { faqKeys } from "@/features/dashboard/faqs/lib/faqs-query";
import {
  faqsListParamsSchema,
  normalizeFaqsListParams,
} from "@/features/dashboard/faqs/lib/faqs-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/faqs/")({
  validateSearch: (search: Record<string, unknown>) =>
    faqsListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
    }),
  loader: async ({ search }: { search: Record<string, unknown> }) => {
    const params = normalizeFaqsListParams(search);
    await prefetchResource(queryClient, faqKeys.list(params), () =>
      fetchFaqs(params),
    );
    return null;
  },
  component: FAQS,
});
