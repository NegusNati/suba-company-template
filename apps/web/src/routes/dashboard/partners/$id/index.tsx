import { createFileRoute } from "@tanstack/react-router";

import { fetchPartnerById } from "@/features/dashboard/partners/lib/partners-api";
import { partnerKeys } from "@/features/dashboard/partners/lib/partners-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/partners/$id/")({
  loader: async ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(
        "Missing partner id. Please navigate from the partners list.",
      );
    }

    await prefetchResource(queryClient, partnerKeys.detail(id), () =>
      fetchPartnerById(id),
    );

    return { id };
  },
});
