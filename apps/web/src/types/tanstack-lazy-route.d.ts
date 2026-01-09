import type { AnyRoute, LazyRoute } from "@tanstack/router-core";
import type { ComponentType, ReactNode } from "react";

type LazyRouteLoader = {
  bivarianceHack(...args: unknown[]): unknown | Promise<unknown>;
}["bivarianceHack"];

declare module "@tanstack/router-core" {
  interface LazyRouteOptions {
    component?: ComponentType<unknown>;
    pendingComponent?: ComponentType<unknown>;
    errorComponent?: ComponentType<unknown>;
    notFoundComponent?: ComponentType<unknown>;
    head?: () => ReactNode;
    staticData?: unknown;
    meta?: Record<string, unknown>;
    /**
     * Allow passing search validators to lazy routes even though the current
     * upstream types don't surface the option. The runtime already accepts it.
     */
    validateSearch?: (
      search: Record<string, unknown>,
    ) => Record<string, unknown>;
    /**
     * Allow passing loaders to lazy routes. These are re-exported by
     * `createLazyFileRoute` but the TS types currently omit them.
     */
    loader?: LazyRouteLoader;
  }
}

declare module "@tanstack/react-router" {
  interface LazyRouteOptions {
    component?: ComponentType<unknown>;
    pendingComponent?: ComponentType<unknown>;
    errorComponent?: ComponentType<unknown>;
    notFoundComponent?: ComponentType<unknown>;
    head?: () => ReactNode;
    staticData?: unknown;
    meta?: Record<string, unknown>;
    validateSearch?: (
      search: Record<string, unknown>,
    ) => Record<string, unknown>;
    loader?: LazyRouteLoader;
    [key: string]: unknown;
  }
  function createLazyFileRoute<
    TFilePath extends string,
    TRoute extends AnyRoute = AnyRoute,
  >(path?: TFilePath): (opts: LazyRouteOptions) => LazyRoute<TRoute>;
}
