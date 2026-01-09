import { createLazyFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COMPANY, SOCIAL_LINKS } from "@/config/template";

export const Route = createLazyFileRoute("/")({
  component: OSSLandingPage,
});

function OSSLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="text-xl font-semibold">Company Template</span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Button asChild variant="outline" size="sm">
              <Link to="/demo">View Demo</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <span className="mr-2">Open Source</span>
            <span className="text-muted-foreground">MIT License</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Production-Ready
            <br />
            <span className="text-primary">Company Website Template</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            A full-stack, TypeScript-first template for building modern company
            websites. Includes a complete CMS dashboard, blog, careers portal,
            case studies, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/demo">Explore Demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Built with Modern Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
            {[
              "React 19",
              "TanStack Router",
              "Hono",
              "Drizzle ORM",
              "PostgreSQL",
              "Better Auth",
              "TailwindCSS",
              "shadcn/ui",
              "Turborepo",
              "Bun",
            ].map((tech) => (
              <span key={tech} className="text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
          <p className="text-muted-foreground">
            A comprehensive template with all the features a modern company
            website requires.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="CMS Dashboard"
            description="Full-featured admin dashboard to manage all content. Create, edit, and publish with ease."
          />
          <FeatureCard
            title="Blog System"
            description="Rich text editor with tag support, SEO metadata, and public/draft states."
          />
          <FeatureCard
            title="Services Showcase"
            description="Highlight your offerings with detailed service pages and categorization."
          />
          <FeatureCard
            title="Case Studies"
            description="Showcase your work with detailed project pages, images, and metrics."
          />
          <FeatureCard
            title="Careers Portal"
            description="Job listings with application tracking. Manage vacancies and applicants."
          />
          <FeatureCard
            title="Contact Forms"
            description="Lead capture with email notifications and message management."
          />
          <FeatureCard
            title="Authentication"
            description="Email/password and Google OAuth with Better Auth. Role-based access control."
          />
          <FeatureCard
            title="SEO Optimized"
            description="Dynamic OG images, sitemap generation, and metadata management."
          />
          <FeatureCard
            title="Modular Backend"
            description="Clean architecture with dependency injection. Easy to extend and test."
          />
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-3xl font-bold">Quick Start</h2>
            <p className="mb-8 text-center text-muted-foreground">
              Get up and running in under 2 minutes with our automated setup
              script.
            </p>

            {/* One-Command Setup */}
            <div className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </div>
                <span className="font-semibold">
                  Clone and run the setup script
                </span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <code className="block rounded bg-background px-4 py-3 border">
                  git clone
                  https://github.com/your-org/suba-company-template.git
                </code>
                <code className="block rounded bg-background px-4 py-3 border">
                  cd suba-company-template
                </code>
                <code className="block rounded bg-primary/10 px-4 py-3 border border-primary/30 text-primary font-semibold">
                  bun setup
                </code>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The setup script will automatically install dependencies, create
                environment files, start PostgreSQL via Docker, push the
                database schema, and seed sample data.
              </p>
            </div>

            {/* What Setup Does */}
            <div className="mb-8 rounded-lg bg-background p-6 border">
              <h3 className="mb-4 font-semibold">
                What <code className="text-primary">bun setup</code> does:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>
                    Checks prerequisites (Bun 1.0+, Docker for PostgreSQL)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Installs all workspace dependencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>
                    Creates <code>.env</code> at project root from{" "}
                    <code>.env.example</code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Starts PostgreSQL database via Docker Compose</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Pushes database schema with Drizzle ORM</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Seeds the database with sample content</span>
                </li>
              </ul>
            </div>

            {/* Start Development */}
            <div className="rounded-xl border-2 border-muted bg-background p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  2
                </div>
                <span className="font-semibold">Start developing</span>
              </div>
              <code className="block rounded bg-muted px-4 py-3 font-mono text-sm">
                bun dev
              </code>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div>
                  <span className="font-medium text-foreground">Frontend:</span>{" "}
                  http://localhost:5173
                </div>
                <div>
                  <span className="font-medium text-foreground">API:</span>{" "}
                  http://localhost:3000
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-muted-foreground">
              See the{" "}
              <a
                href={SOCIAL_LINKS.github}
                className="text-primary hover:underline"
              >
                README
              </a>{" "}
              for manual setup and configuration options.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Links */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Explore the Template</h2>
          <p className="text-muted-foreground">
            See the full marketing site and dashboard in action.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>Marketing Site Demo</CardTitle>
              <CardDescription>
                See the full public-facing website with all landing pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/demo">View Demo Site</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>CMS Dashboard</CardTitle>
              <CardDescription>
                Explore the admin dashboard for content management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {COMPANY.foundedYear} {COMPANY.name}. Released under the MIT
            License.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
