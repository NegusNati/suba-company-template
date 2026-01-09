import { createFileRoute } from "@tanstack/react-router";

import UserDetail from "@/features/dashboard/user-management/detail";

export const Route = createFileRoute("/dashboard/user-management/$userId/")({
  component: UserDetail,
});
