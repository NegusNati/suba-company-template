import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export const Route = createLazyFileRoute("/forbidden")({
  component: Forbidden,
});

function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          403 — Forbidden
        </p>
        <h1 className="text-2xl font-bold">You don&apos;t have access</h1>
        <p className="mt-2 text-muted-foreground">
          Your account does not have permission to access the dashboard. Please
          contact an administrator if you believe this is a mistake.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}
