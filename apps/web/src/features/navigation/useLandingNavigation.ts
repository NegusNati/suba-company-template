import { useRouter, useRouterState } from "@tanstack/react-router";
import type { RouterState } from "@tanstack/react-router";
import { useCallback } from "react";

import { landingCtas, landingNavItems } from "./config";

import { landingPagePaths, type Page } from "@/types/navigation";

export function useLandingNavigation() {
  const router = useRouter();
  const pathname = useRouterState({
    select: (state: RouterState) => state.location.pathname,
  });

  const navigateTo = useCallback(
    (page: Page) => {
      const target = landingPagePaths[page] ?? landingPagePaths.home;
      router.navigate({ to: target as never });
    },
    [router],
  );

  const isActive = useCallback(
    (page: Page) =>
      pathname === (landingPagePaths[page] ?? landingPagePaths.home),
    [pathname],
  );

  return {
    pathname,
    navItems: landingNavItems,
    ctas: landingCtas,
    navigateTo,
    isActive,
  };
}
