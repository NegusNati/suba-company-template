import { createLazyFileRoute, redirect } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/dashboard/")({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard/blogs",
    });
  },
  component: () => null,
});
