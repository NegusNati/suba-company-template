import { BusinessSectorForm } from "../components/business-sector-form";
import { useBusinessSectorByIdQuery } from "../lib/business-sectors-query";
import type { UpdateBusinessSector } from "../lib/business-sectors-schema";

interface SectorEditProps {
  sectorId: number;
}

export default function SectorEdit({ sectorId }: SectorEditProps) {
  const { data, isPending, isError, error } =
    useBusinessSectorByIdQuery(sectorId);

  if (isPending) {
    return <div className="p-8">Loading business sector...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load sector{error ? `: ${error.message}` : ""}
      </div>
    );
  }

  const sector = data.data;

  const initialData: UpdateBusinessSector = {
    id: sector.id,
    title: sector.title,
    slug: sector.slug,
    excerpt: sector.excerpt,
    history: sector.history,
    featuredImageUrl: sector.featuredImageUrl,
    publishDate: sector.publishDate,
    phoneNumber: sector.phoneNumber,
    emailAddress: sector.emailAddress,
    address: sector.address,
    facebookUrl: sector.facebookUrl,
    instagramUrl: sector.instagramUrl,
    linkedinUrl: sector.linkedinUrl,
    stats: sector.stats,
    services: sector.services,
    gallery: sector.gallery,
  };

  return <BusinessSectorForm mode="edit" initialData={initialData} />;
}
