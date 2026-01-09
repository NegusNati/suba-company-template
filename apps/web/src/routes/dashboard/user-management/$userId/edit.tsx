import { createFileRoute } from "@tanstack/react-router";

import EditUser from "@/features/dashboard/user-management/form/edit-user";

export const Route = createFileRoute("/dashboard/user-management/$userId/edit")(
  {
    component: EditUser,
  },
);
