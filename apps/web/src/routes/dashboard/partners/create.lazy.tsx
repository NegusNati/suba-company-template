import { createLazyFileRoute } from "@tanstack/react-router";

import { PartnerForm } from "@/features/dashboard/partners/PartnerForm";

export const Route = createLazyFileRoute("/dashboard/partners/create")({
  component: () => <PartnerForm mode="create" />,
});
