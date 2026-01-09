import { createLazyFileRoute } from "@tanstack/react-router";

import Socials from "@/features/dashboard/socials";
import { fetchSocials } from "@/features/dashboard/socials/lib/socials-api";
import { socialKeys } from "@/features/dashboard/socials/lib/socials-query";
import {
  normalizeSocialsListParams,
  socialsListParamsSchema,
} from "@/features/dashboard/socials/lib/socials-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/socials/")({
  validateSearch: (search: Record<string, unknown>) =>
    socialsListParamsSchema.partial().parse({
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
    const params = normalizeSocialsListParams(search);
    await prefetchResource(queryClient, socialKeys.list(params), () =>
      fetchSocials(params),
    );
    return null;
  },
  component: Socials,
});
