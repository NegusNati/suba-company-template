import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  Blog,
  BlogsListParams,
  CreateBlogInput,
  UpdateBlogInput,
} from "./blogs-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type BlogResponse = ApiSuccessResponse<Blog>;
export type BlogsListResponse = ApiSuccessResponse<Blog[]>;
export type DeleteBlogResponse = ApiSuccessResponse<{ message: string }>;

type BlogFormMultipartPayload = {
  title?: string;
  excerpt?: string;
  content?: string;
  authorId?: string;
  publishDate?: string;
  readTimeMinutes?: number;
  tagIds?: number[];
  featuredImage?: File;
};

const buildBlogFormData = (values: BlogFormMultipartPayload) => {
  const formData = new FormData();

  if (values.title !== undefined) {
    formData.append("title", values.title);
  }

  if (values.excerpt !== undefined) {
    formData.append("excerpt", values.excerpt);
  }

  if (values.content !== undefined) {
    formData.append("content", values.content);
  }

  if (values.authorId !== undefined) {
    formData.append("authorId", values.authorId);
  }

  if (values.publishDate !== undefined) {
    formData.append("publishDate", values.publishDate);
  }

  if (values.readTimeMinutes !== undefined) {
    formData.append("readTimeMinutes", String(values.readTimeMinutes));
  }

  if (values.tagIds && values.tagIds.length > 0) {
    formData.append("tagIds", JSON.stringify(values.tagIds));
  }

  if (values.featuredImage) {
    formData.append("featuredImage", values.featuredImage);
  }

  return formData;
};

export const fetchBlogs = async (params: BlogsListParams) => {
  const { data } = await apiClient.get<BlogsListResponse>(
    AUTH_API_ENDPOINTS.BLOG,
    { params },
  );

  return data;
};

export const fetchBlogById = async (
  id: number | string,
  options?: { includeTags?: boolean },
) => {
  const { data } = await apiClient.get<BlogResponse>(
    `${AUTH_API_ENDPOINTS.BLOG}/${id}`,
    {
      params:
        options && options.includeTags
          ? { includeTags: String(options.includeTags) }
          : undefined,
    },
  );

  return data;
};

export const fetchBlogBySlug = async (slug: string) => {
  const { data } = await apiClient.get<BlogResponse>(
    `${AUTH_API_ENDPOINTS.BLOG}/slug/${slug}`,
  );

  return data;
};

export const createBlog = async (
  values: CreateBlogInput & { authorId: string },
) => {
  const formData = buildBlogFormData({
    title: values.title,
    excerpt: values.excerpt,
    content: values.content,
    authorId: values.authorId,
    publishDate: values.publishDate,
    readTimeMinutes: values.readTimeMinutes,
    tagIds: values.tagIds,
    featuredImage: values.featuredImage,
  });

  const { data } = await apiClient.post<BlogResponse>(
    AUTH_API_ENDPOINTS.BLOG,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateBlog = async (
  id: number | string,
  values: UpdateBlogInput,
) => {
  const formData = buildBlogFormData({
    title: values.title,
    excerpt: values.excerpt,
    content: values.content,
    authorId: values.authorId,
    publishDate: values.publishDate,
    readTimeMinutes: values.readTimeMinutes,
    tagIds: values.tagIds,
    featuredImage: values.featuredImage,
  });

  const { data } = await apiClient.patch<BlogResponse>(
    `${AUTH_API_ENDPOINTS.BLOG}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteBlog = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteBlogResponse>(
    `${AUTH_API_ENDPOINTS.BLOG}/${id}`,
  );

  return data;
};
