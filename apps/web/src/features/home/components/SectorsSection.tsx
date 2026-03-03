import { Link } from "@tanstack/react-router";

import { API_BASE_URL } from "@/lib/api-base";
import { usePublicBusinessSectors } from "@/lib/business-sectors";

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

export function SectorsSection() {
  const { data, isLoading } = usePublicBusinessSectors({
    limit: 3,
    sortBy: "publishDate",
    sortOrder: "desc",
  });

  const sectors = data?.data ?? [];

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm text-muted-foreground">
            Loading sectors...
          </p>
        </div>
      </section>
    );
  }

  if (sectors.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif text-foreground md:text-4xl">
              Business Sectors
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Industry-focused capabilities tailored for measurable business
              outcomes.
            </p>
          </div>
          <Link
            to="/demo/sectors"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all sectors →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sectors.map((sector) => {
            const imageUrl = resolveImageUrl(sector.featuredImageUrl);
            return (
              <Link
                key={sector.id}
                to="/demo/sectors/$slug"
                params={{ slug: sector.slug }}
                className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[16/10] bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={sector.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-xl font-semibold">{sector.title}</h3>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {sector.excerpt || "No summary available."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
