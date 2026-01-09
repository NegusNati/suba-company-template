import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  CreateProductInput,
  Product,
  ProductsListParams,
  UpdateProductInput,
} from "./products-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type ProductResponse = ApiSuccessResponse<Product>;
export type ProductListResponse = ApiSuccessResponse<Product[]>;
export type DeleteProductResponse = ApiSuccessResponse<{ message: string }>;

type ProductFormMultipartPayload = {
  title?: string;
  description?: string;
  overview?: string | null;
  productLink?: string | null;
  tagIds?: number[];
  imagesMeta?: Array<{ position: number; caption?: string }>;
  images?: File[];
};

const buildProductFormData = (values: ProductFormMultipartPayload) => {
  const formData = new FormData();

  if (values.title !== undefined) {
    formData.append("title", values.title);
  }

  if (values.description !== undefined) {
    formData.append("description", values.description);
  }

  if (values.overview !== undefined && values.overview !== null) {
    formData.append("overview", values.overview);
  }

  if (values.productLink !== undefined && values.productLink !== null) {
    formData.append("productLink", values.productLink);
  }

  if (values.tagIds && values.tagIds.length > 0) {
    formData.append("tagIds", JSON.stringify(values.tagIds));
  }

  if (values.imagesMeta && values.imagesMeta.length > 0) {
    const normalizedMeta = values.imagesMeta.map((meta, index) => ({
      position:
        typeof meta.position === "number" ? meta.position : Number(index),
      caption: meta.caption,
    }));

    formData.append("imagesMeta", JSON.stringify(normalizedMeta));
  }

  if (values.images && values.images.length > 0) {
    values.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
  }

  return formData;
};

export const fetchProducts = async (params: ProductsListParams) => {
  const { data } = await apiClient.get<ProductListResponse>(
    AUTH_API_ENDPOINTS.PRODUCTS,
    { params },
  );

  return data;
};

export const fetchProductById = async (id: number | string) => {
  const { data } = await apiClient.get<ProductResponse>(
    `${AUTH_API_ENDPOINTS.PRODUCTS}/${id}`,
  );

  return data;
};

export const createProduct = async (values: CreateProductInput) => {
  const formData = buildProductFormData({
    title: values.title,
    description: values.description,
    overview: values.overview ?? null,
    productLink: values.productLink ?? null,
    tagIds: values.tagIds,
    imagesMeta: values.imagesMeta,
    images: values.images,
  });

  const { data } = await apiClient.post<ProductResponse>(
    AUTH_API_ENDPOINTS.PRODUCTS,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const updateProduct = async (
  id: number | string,
  values: UpdateProductInput,
) => {
  const formData = buildProductFormData({
    title: values.title,
    description: values.description,
    overview: values.overview ?? null,
    productLink: values.productLink ?? null,
    tagIds: values.tagIds,
    imagesMeta: values.imagesMeta,
    images: values.images,
  });

  const { data } = await apiClient.patch<ProductResponse>(
    `${AUTH_API_ENDPOINTS.PRODUCTS}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
};

export const deleteProduct = async (id: number | string) => {
  const { data } = await apiClient.delete<DeleteProductResponse>(
    `${AUTH_API_ENDPOINTS.PRODUCTS}/${id}`,
  );

  return data;
};
