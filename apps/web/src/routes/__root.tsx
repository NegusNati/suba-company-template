import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/config/template";
import { ThemeProvider } from "@/context/theme-context";
import "../index.css";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const mod = await import("@tanstack/react-query-devtools");
      return { default: mod.ReactQueryDevtools };
    })
  : null;

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const mod = await import("@tanstack/react-router-devtools");
      return { default: mod.TanStackRouterDevtools };
    })
  : null;

export type RouterAppContext = Record<string, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: SITE.defaultTitle,
      },
      {
        name: "description",
        content: SITE.defaultDescription,
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  // const isFetching = useRouterState({
  //   select: (s) => s.isLoading,
  // });

  return (
    <>
      <HeadContent />

      <ThemeProvider defaultTheme="light">
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
      {import.meta.env.DEV && ReactQueryDevtools && TanStackRouterDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools buttonPosition="bottom-right" />
          <TanStackRouterDevtools position="bottom-left" />
        </Suspense>
      )}
    </>
  );
}
