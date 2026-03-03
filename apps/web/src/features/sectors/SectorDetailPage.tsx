import { Link, useRouter } from "@tanstack/react-router";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { API_BASE_URL } from "@/lib/api-base";
import type { PublicBusinessSectorDetail } from "@/lib/business-sectors";

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

interface SectorDetailPageProps {
  sector: PublicBusinessSectorDetail;
}

export function SectorDetailPage({ sector }: SectorDetailPageProps) {
  const router = useRouter();

  const featuredImageUrl = resolveImageUrl(sector.featuredImageUrl);

  const socialLinks = [
    { label: "Facebook", href: sector.facebookUrl },
    { label: "Instagram", href: sector.instagramUrl },
    { label: "LinkedIn", href: sector.linkedinUrl },
  ].filter((item) => Boolean(item.href));

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <button
          onClick={() => router.navigate({ to: "/demo/sectors" as never })}
          className="mb-8 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to sectors
        </button>

        <section className="mb-8 space-y-4">
          <h1 className="text-4xl font-serif font-semibold tracking-tight text-foreground md:text-5xl">
            {sector.title}
          </h1>
          <p className="text-muted-foreground">{sector.excerpt}</p>
        </section>

        {featuredImageUrl ? (
          <div className="mb-10 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted">
            <img
              src={featuredImageUrl}
              alt={sector.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        {sector.stats.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold">Key Stats</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {sector.stats.map((stat) => (
                <div key={stat.id} className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {stat.statKey}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {stat.statValue}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">History</h2>
          <div className="rounded-xl border bg-card p-4">
            <LexicalViewer content={sector.history} />
          </div>
        </section>

        {sector.services.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold">What We Do</h2>
            <div className="space-y-4">
              {sector.services.map((service) => {
                const imageUrl = resolveImageUrl(service.imageUrl);
                return (
                  <article
                    key={service.id}
                    className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[220px_1fr]"
                  >
                    <div className="h-36 overflow-hidden rounded-lg bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={service.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description || "No description provided."}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {sector.gallery.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {sector.gallery.map((image) => (
                <div
                  key={image.id}
                  className="aspect-[16/10] overflow-hidden rounded-xl border bg-muted"
                >
                  <img
                    src={resolveImageUrl(image.imageUrl)}
                    alt={sector.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            {sector.phoneNumber ? <p>Phone: {sector.phoneNumber}</p> : null}
            {sector.emailAddress ? <p>Email: {sector.emailAddress}</p> : null}
            {sector.address ? <p>Address: {sector.address}</p> : null}
          </div>

          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href!}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border px-3 py-1 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}

          <div className="mt-6">
            <Link
              to="/demo/contact"
              className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Contact Team
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
