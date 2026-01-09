import type { services, serviceImages } from "@suba-company-template/db/schema";

type Service = typeof services.$inferSelect;
type ServiceImage = typeof serviceImages.$inferSelect;

export interface ServiceAdminDTO {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  images?: Array<{
    id: number;
    imageUrl: string;
    position: number;
  }>;
}

export interface ServicePublicDTO {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
}

export interface ServicePublicDetailDTO {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  images: Array<{
    imageUrl: string;
    position: number;
  }>;
  createdAt: string;
}

export const toServiceAdminDTO = (
  service: Service,
  images?: ServiceImage[],
): ServiceAdminDTO => {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    excerpt: service.excerpt ?? null,
    description: service.description ?? null,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    images: images
      ? images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          position: img.position,
        }))
      : undefined,
  };
};

export const toServicePublicDTO = (
  service: Service,
  featuredImage: string | null,
): ServicePublicDTO => {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    excerpt: service.excerpt ?? null,
    featuredImage,
  };
};

export const toServicePublicDetailDTO = (
  service: Service,
  images: ServiceImage[],
): ServicePublicDetailDTO => {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description ?? null,
    images: images.map((img) => ({
      imageUrl: img.imageUrl,
      position: img.position,
    })),
    createdAt: service.createdAt,
  };
};
