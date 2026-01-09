import type {
  GalleryItem,
  CreateGalleryItem,
  UpdateGalleryItem,
} from "./gallery-schema";
import type { GalleryListParams } from "./gallery-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

/**
 * API response structure for paginated data
 */
interface PaginatedGalleryResponse {
  success: boolean;
  data: GalleryItem[];
  meta: {
    timestamp: string;
    requestId: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API response for gallery list
 */
export type GalleryListResponse = PaginatedGalleryResponse;

/**
 * API response for gallery detail
 */
export type GalleryDetailResponse = {
  success: boolean;
  data: GalleryItem;
};

/**
 * API response for delete gallery item
 */
export type DeleteGalleryResponse = {
  success: boolean;
  data: { message: string };
};

/**
 * Fetch gallery items with pagination, search, and filtering
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of gallery items
 */
export async function fetchGalleryItems(
  params: GalleryListParams,
): Promise<GalleryListResponse> {
  const response = await apiClient.get<GalleryListResponse>(
    AUTH_API_ENDPOINTS.GALLERY,
    { params },
  );
  return response.data;
}

/**
 * Fetch a single gallery item by ID
 * @param id - Gallery item ID
 * @returns Gallery item details
 */
export async function fetchGalleryItemById(
  id: number,
): Promise<GalleryDetailResponse> {
  const response = await apiClient.get<GalleryDetailResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY}/${id}`,
  );
  return response.data;
}

/**
 * Helper function to build FormData for gallery item submission
 * Handles multipart/form-data for file uploads
 */
export function buildGalleryFormData(
  values: CreateGalleryItem | UpdateGalleryItem,
): FormData {
  const formData = new FormData();

  // Add text fields
  if (values.title) {
    formData.append("title", values.title);
  }

  if (values.description) {
    formData.append("description", values.description);
  }

  if (values.occurredAt) {
    formData.append("occurredAt", values.occurredAt);
  }

  // Add image file if provided
  if (values.image) {
    formData.append("image", values.image);
  }

  // Add imageUrl if provided (for updates without new file upload)
  if ("imageUrl" in values && values.imageUrl) {
    formData.append("imageUrl", values.imageUrl);
  }

  return formData;
}

/**
 * Create a new gallery item
 * @param data - Gallery item  data including image file
 * @returns Created gallery item
 */
export async function createGalleryItem(
  data: CreateGalleryItem,
): Promise<GalleryDetailResponse> {
  const formData = buildGalleryFormData(data);

  const response = await apiClient.post<GalleryDetailResponse>(
    AUTH_API_ENDPOINTS.GALLERY,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Update an existing gallery item
 * @param id - Gallery item ID
 * @param data - Partial gallery item data to update
 * @returns Updated gallery item
 */
export async function updateGalleryItem(
  id: number,
  data: UpdateGalleryItem,
): Promise<GalleryDetailResponse> {
  const formData = buildGalleryFormData(data);

  const response = await apiClient.patch<GalleryDetailResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY}/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Delete a gallery item
 * @param id - Gallery item ID
 * @returns Success confirmation
 */
export async function deleteGalleryItem(
  id: number,
): Promise<DeleteGalleryResponse> {
  const response = await apiClient.delete<DeleteGalleryResponse>(
    `${AUTH_API_ENDPOINTS.GALLERY}/${id}`,
  );

  return response.data;
}
