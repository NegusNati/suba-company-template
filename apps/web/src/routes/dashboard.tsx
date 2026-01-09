import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Cookies from "js-cookie";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/dashboard/layout/app-sidebar";
import Header from "@/features/dashboard/layout/header";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }
    // Role is now directly on the session user object (Better Auth admin plugin)
    const role = (session.data.user.role as string) || "user";
    const allowed = role === "admin" || role === "blogger";
    if (!allowed) {
      throw redirect({
        to: "/forbidden",
      });
    }
    return { session, role };
  },
});

function DashboardLayout() {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div
        id="content"
        className={cn(
          "ml-auto w-full max-w-full",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "transition-[width] duration-200 ease-linear",
          "flex h-svh flex-col",
          "group-data-[scroll-locked=1]/body:h-full",
          "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh",
        )}
      >
        <Header />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
