import type {
  TagDto,
  ImageDto,
  ServiceSummaryDto,
  PartnerSummaryDto,
  ManagerDto,
} from "../types/relations";

/**
 * Map tag list ensuring consistent structure and sorting
 */
export const mapTagList = (
  tags: Array<{ id: number; name: string; slug: string }>,
): TagDto[] => {
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }));
};

/**
 * Map image list with position sorting
 */
export const mapImageList = (
  images: Array<{
    id: number;
    imageUrl: string;
    caption?: string | null;
    position?: number;
  }>,
  sortByPosition: boolean = true,
): ImageDto[] => {
  const mapped: ImageDto[] = images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    ...(img.caption && { caption: img.caption }),
    ...(img.position !== undefined && { position: img.position }),
  }));

  if (sortByPosition && mapped.some((img) => img.position !== undefined)) {
    return mapped.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return mapped;
};

/**
 * Map service summary
 */
export const mapServiceSummary = (service: {
  id: number;
  title: string;
  slug: string;
}): ServiceSummaryDto => {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
  };
};

/**
 * Map partner summary
 */
export const mapPartnerSummary = (partner: {
  id: number;
  title: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl?: string | null;
}): PartnerSummaryDto => {
  return {
    id: partner.id,
    title: partner.title,
    slug: partner.slug,
    logoUrl: partner.logoUrl,
    ...(partner.websiteUrl && { websiteUrl: partner.websiteUrl }),
  };
};

/**
 * Map manager object from company members
 */
export const mapManager = (manager: {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
}): ManagerDto => {
  return {
    id: manager.id,
    firstName: manager.firstName,
    lastName: manager.lastName,
    title: manager.title,
  };
};
