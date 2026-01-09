import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import apiClient from "@/lib/axios";

export interface PublicBlogListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishDate: string | null;
  readTimeMinutes: number | null;
}

export interface PublicBlogDetail extends PublicBlogListItem {
  content: string;
  author: {
    id: string;
    name: string;
    email?: string;
    image: string | null;
    socials: Array<{
      id: number;
      handle: string | null;
      fullUrl: string | null;
      title: string;
      iconUrl: string | null;
      baseUrl: string;
    }>;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export type PublicBlogsListResponse = ApiSuccessResponse<PublicBlogListItem[]>;
export type PublicBlogDetailResponse = ApiSuccessResponse<PublicBlogDetail>;

export const fetchPublicBlogs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { data } = await apiClient.get<PublicBlogsListResponse>(
    "/api/v1/blogs/client",
    { params },
  );

  return data;
};

export const fetchPublicBlogById = async (id: number | string) => {
  const { data } = await apiClient.get<PublicBlogDetailResponse>(
    `/api/v1/blogs/client/${id}`,
  );

  return data;
};

export const fetchPublicBlogBySlug = async (slug: string) => {
  const { data } = await apiClient.get<PublicBlogDetailResponse>(
    `/api/v1/blogs/client/slug/${slug}`,
  );

  return data;
};
