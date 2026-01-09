import {
  queryOptions,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import { fetchClientPartners } from "./partners-api";
import type { ClientPartner } from "./partners-schema";

// ============================================================================
// Query Keys
// ============================================================================

export const partnerKeys = {
  all: ["partners"] as const,
  clients: () => [...partnerKeys.all, "client"] as const,
};

// ============================================================================
// Query Options (for TanStack Router prefetching)
// ============================================================================

export const clientPartnersQueryOptions = () =>
  queryOptions({
    queryKey: partnerKeys.clients(),
    queryFn: fetchClientPartners,
  });

// ============================================================================
// Query Hooks
// ============================================================================

interface ClientPartnersResponse {
  data: ClientPartner[];
}

export const useClientPartnersQuery = (): UseQueryResult<
  ClientPartnersResponse,
  Error
> => {
  return useQuery(clientPartnersQueryOptions());
};
