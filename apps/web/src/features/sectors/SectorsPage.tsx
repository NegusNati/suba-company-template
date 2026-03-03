import { SectorCard } from "./components/SectorCard";

import GrowthGraphic from "@/assets/about-us/growth.svg";
import { PageHeader } from "@/components/common/PageHeader";
import { usePublicBusinessSectors } from "@/lib/business-sectors";

export function SectorsPage() {
  const { data, isLoading, isError, error } = usePublicBusinessSectors({
    limit: 50,
    sortBy: "title",
    sortOrder: "asc",
  });

  const sectors = data?.data ?? [];

  return (
    <>
      <PageHeader image={GrowthGraphic} imageAlt="Business growth" />
      <div className="w-full min-h-screen pb-20">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <header className="mb-8">
            <h1 className="mb-2 text-4xl font-serif font-semibold tracking-tight text-foreground">
              Business Sectors
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Explore our sector-specific offerings, delivery capabilities, and
              operating footprints.
            </p>
          </header>

          {isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading sectors...
            </p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-destructive">
              Failed to load sectors{error ? `: ${error.message}` : ""}
            </p>
          ) : sectors.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No published sectors available.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sectors.map((sector) => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
