import type { galleryItems } from "@suba-company-template/db/schema";

type GalleryItem = typeof galleryItems.$inferSelect;

export interface GalleryItemAdminDTO {
  id: number;
  imageUrl: string;
  title: string | null;
  description: string | null;
  occurredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItemPublicDTO {
  id: number;
  imageUrl: string;
  title: string | null;
  description: string | null;
  occurredAt: string | null;
}

export const toGalleryItemAdminDTO = (
  item: GalleryItem,
): GalleryItemAdminDTO => {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.title ?? null,
    description: item.description ?? null,
    occurredAt: item.occurredAt ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const toGalleryItemPublicDTO = (
  item: GalleryItem,
): GalleryItemPublicDTO => {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.title ?? null,
    description: item.description ?? null,
    occurredAt: item.occurredAt ?? null,
  };
};
