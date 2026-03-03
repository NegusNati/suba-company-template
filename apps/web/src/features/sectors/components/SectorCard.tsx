import { Link } from "@tanstack/react-router";

import { API_BASE_URL } from "@/lib/api-base";
import type { PublicBusinessSectorListItem } from "@/lib/business-sectors";

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

interface SectorCardProps {
  sector: PublicBusinessSectorListItem;
}

export function SectorCard({ sector }: SectorCardProps) {
  const imageUrl = resolveImageUrl(sector.featuredImageUrl);

  return (
    <Link
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
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-xl font-semibold text-foreground">
          {sector.title}
        </h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {sector.excerpt || "No summary available."}
        </p>
      </div>
    </Link>
  );
}
