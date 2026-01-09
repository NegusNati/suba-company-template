import { createLazyFileRoute } from "@tanstack/react-router";

import Partners from "@/features/dashboard/partners";
import { fetchPartners } from "@/features/dashboard/partners/lib/partners-api";
import { partnerKeys } from "@/features/dashboard/partners/lib/partners-query";
import {
  normalizePartnersListParams,
  partnersListParamsSchema,
} from "@/features/dashboard/partners/lib/partners-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/partners/")({
  validateSearch: (search: Record<string, unknown>) =>
    partnersListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
    }),
  loader: async ({ search }: { search: Record<string, unknown> }) => {
    const params = normalizePartnersListParams(search);
    await prefetchResource(queryClient, partnerKeys.list(params), () =>
      fetchPartners(params),
    );
    return null;
  },
  component: Partners,
});
