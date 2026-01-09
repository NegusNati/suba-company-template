import type { ApiSuccessResponse } from "@suba-company-template/types/api";

import type { ClientPartner } from "./partners-schema";

import apiClient from "@/lib/axios";

export type ClientPartnersListResponse = ApiSuccessResponse<ClientPartner[]>;

/**
 * Fetches partners from the public client endpoint.
 * Returns partners with logos for the landing page slider.
 */
export const fetchClientPartners = async () => {
  const { data } = await apiClient.get<ClientPartnersListResponse>(
    "/api/v1/partners/client",
  );

  return data;
};
