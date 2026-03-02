import { createLazyFileRoute } from "@tanstack/react-router";

import UserDetail from "@/features/dashboard/user-management/detail";

export const Route = createLazyFileRoute("/dashboard/user-management/$userId/")(
  {
    component: UserDetail,
  },
);
