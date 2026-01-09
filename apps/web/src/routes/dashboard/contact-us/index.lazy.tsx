import { createLazyFileRoute } from "@tanstack/react-router";

import ContactUs from "@/features/dashboard/contact-us";
import { fetchContacts } from "@/features/dashboard/contact-us/lib/contact-api";
import { contactKeys } from "@/features/dashboard/contact-us/lib/contact-query";
import {
  contactListParamsSchema,
  normalizeContactListParams,
  type ContactListParams,
} from "@/features/dashboard/contact-us/lib/contact-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/contact-us/")({
  validateSearch: (search: Record<string, unknown>) =>
    contactListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      isHandled:
        typeof search.isHandled === "boolean" ? search.isHandled : undefined,
    }),
  loader: async ({ search }: { search: Record<string, unknown> }) => {
    const params = normalizeContactListParams(
      (search as Partial<ContactListParams>) ?? {},
    );
    await prefetchResource(queryClient, contactKeys.list(params), () =>
      fetchContacts(params),
    );
    return null;
  },
  component: ContactUs,
});
