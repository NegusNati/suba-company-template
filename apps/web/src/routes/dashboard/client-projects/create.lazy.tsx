import { createLazyFileRoute } from "@tanstack/react-router";

import { ClientProjectForm } from "@/features/dashboard/client-projects/form/client-project-form";

export const Route = createLazyFileRoute("/dashboard/client-projects/create")({
  component: () => <ClientProjectForm mode="create" />,
});
