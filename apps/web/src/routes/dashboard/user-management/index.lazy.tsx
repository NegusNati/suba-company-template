import { createLazyFileRoute } from "@tanstack/react-router";

import UserManagementList from "@/features/dashboard/user-management/index";
import { fetchUsers } from "@/features/dashboard/user-management/lib/users-api";
import { userKeys } from "@/features/dashboard/user-management/lib/users-query";
import {
  normalizeUsersListParams,
  usersListParamsSchema,
} from "@/features/dashboard/user-management/lib/users-schema";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createLazyFileRoute("/dashboard/user-management/")({
  validateSearch: (search: Record<string, unknown>) =>
    usersListParamsSchema.partial().parse({
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
      sortOrder:
        search.sortOrder === "asc" || search.sortOrder === "desc"
          ? search.sortOrder
          : undefined,
      role:
        search.role === "admin" ||
        search.role === "blogger" ||
        search.role === "user"
          ? search.role
          : undefined,
    }),
  loader: async ({ search }: { search: Record<string, unknown> }) => {
    const params = normalizeUsersListParams(search);
    await prefetchResource(queryClient, userKeys.list(params), () =>
      fetchUsers(params),
    );
    return null;
  },
  component: UserManagementList,
});
