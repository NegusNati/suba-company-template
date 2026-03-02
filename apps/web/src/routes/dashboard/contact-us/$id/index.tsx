import { createFileRoute } from "@tanstack/react-router";

import { fetchContactById } from "@/features/dashboard/contact-us/lib/contact-api";
import { contactKeys } from "@/features/dashboard/contact-us/lib/contact-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/contact-us/$id/")({
  loader: async ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(
        "Missing contact id. Please navigate from the contact list.",
      );
    }

    await prefetchResource(queryClient, contactKeys.detail(id), () =>
      fetchContactById(id),
    );

    return { id };
  },
});
