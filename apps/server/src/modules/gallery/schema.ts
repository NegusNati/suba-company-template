import type {
  galleryCategories,
  galleryItems,
} from "@suba-company-template/db/schema";

type GalleryItem = typeof galleryItems.$inferSelect;
type GalleryCategory = typeof galleryCategories.$inferSelect;

export interface GalleryCategorySummaryDTO {
  id: number;
  name: string;
  slug: string;
}

export interface GalleryItemAdminDTO {
  id: number;
  imageUrls: string[];
  coverImageUrl: string | null;
  imageCount: number;
  title: string;
  description: string | null;
  occurredAt: string | null;
  category: GalleryCategorySummaryDTO;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItemPublicDTO {
  id: number;
  imageUrls: string[];
  coverImageUrl: string | null;
  imageCount: number;
  title: string;
  description: string | null;
  occurredAt: string | null;
  category: GalleryCategorySummaryDTO;
}

export const toGalleryCategorySummaryDTO = (
  category: GalleryCategory,
): GalleryCategorySummaryDTO => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
});

export const toGalleryItemAdminDTO = (
  item: GalleryItem,
  category: GalleryCategory,
): GalleryItemAdminDTO => ({
  id: item.id,
  imageUrls: item.imageUrls,
  coverImageUrl: item.imageUrls[0] ?? null,
  imageCount: item.imageUrls.length,
  title: item.title,
  description: item.description ?? null,
  occurredAt: item.occurredAt ?? null,
  category: toGalleryCategorySummaryDTO(category),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const toGalleryItemPublicDTO = (
  item: GalleryItem,
  category: GalleryCategory,
): GalleryItemPublicDTO => ({
  id: item.id,
  imageUrls: item.imageUrls,
  coverImageUrl: item.imageUrls[0] ?? null,
  imageCount: item.imageUrls.length,
  title: item.title,
  description: item.description ?? null,
  occurredAt: item.occurredAt ?? null,
  category: toGalleryCategorySummaryDTO(category),
});
