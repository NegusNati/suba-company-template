import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/config/template";
import { ThemeProvider } from "@/context/theme-context";
import "../index.css";

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
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
