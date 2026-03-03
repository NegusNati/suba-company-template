import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type {
  PublicBusinessSectorDetail,
  PublicBusinessSectorListItem,
  PublicBusinessSectorsParams,
} from "./business-sectors-schema";

import { LANDING_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";

export type PublicBusinessSectorsListResponse = ApiSuccessResponse<
  PublicBusinessSectorListItem[]
>;
export type PublicBusinessSectorDetailResponse =
  ApiSuccessResponse<PublicBusinessSectorDetail>;

export const fetchPublicBusinessSectors = async (
  params?: PublicBusinessSectorsParams,
) => {
  const { data } = await apiClient.get<PublicBusinessSectorsListResponse>(
    LANDING_API_ENDPOINTS.BUSINESS_SECTORS_CLIENT,
    { params },
  );

  return data;
};

export const fetchPublicBusinessSectorBySlug = async (slug: string) => {
  const { data } = await apiClient.get<PublicBusinessSectorDetailResponse>(
    `${LANDING_API_ENDPOINTS.BUSINESS_SECTORS_CLIENT}/slug/${slug}`,
  );

  return data;
};

export const fetchPublicBusinessSectorById = async (id: number | string) => {
  const { data } = await apiClient.get<PublicBusinessSectorDetailResponse>(
    `${LANDING_API_ENDPOINTS.BUSINESS_SECTORS_CLIENT}/${id}`,
  );

  return data;
};
