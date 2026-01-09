import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

import { installRateLimitHandler } from "@/lib/rate-limit-tracker";

installRateLimitHandler();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: {},
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        if (error instanceof AxiosError) {
          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
