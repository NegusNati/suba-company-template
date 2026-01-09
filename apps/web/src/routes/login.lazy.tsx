import { Link, useNavigate, createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-base";
import { authClient } from "@/lib/auth-client";

export const Route = createLazyFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      navigate({ to: "/dashboard" });
    }
  }, [session, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/sign-in/email`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error?.message || payload?.message || "Failed to sign in";
        throw new Error(message);
      }

      await authClient.getSession();
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isPending || isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    setError(null);

    try {
      await authClient.signIn.social({ provider: "google" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google",
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Admin Sign In</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isGoogleSubmitting || isPending}
          >
            {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="email">Work Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
          <p>Need access? Ask an administrator to add you in Better Auth.</p>
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-primary">
              Create one
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
