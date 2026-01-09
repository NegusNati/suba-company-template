import { createLazyFileRoute } from "@tanstack/react-router";

import CreateUser from "@/features/dashboard/user-management/form/create-user";

export const Route = createLazyFileRoute("/dashboard/user-management/create")({
  component: CreateUser,
});
