import { useNavigate, Link, createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-base";
import { authClient } from "@/lib/auth-client";

export const Route = createLazyFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
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
        `${API_BASE_URL}/api/v1/auth/sign-up/email`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error?.message || payload?.message || "Failed to register";
        throw new Error(message);
      }

      await authClient.getSession();
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
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
        err instanceof Error ? err.message : "Failed to sign up with Google",
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Create an Account</h1>
          <p className="text-muted-foreground">
            Register with your email to access the dashboard.
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
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </Field>
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary">
            Sign in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
