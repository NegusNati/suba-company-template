// Schema exports
export type { ClientPartner, ClientPartnersResponse } from "./partners-schema";
export {
  ClientPartnerSchema,
  ClientPartnersResponseSchema,
  getPartnerLogoUrl,
} from "./partners-schema";

// API exports
export { fetchClientPartners } from "./partners-api";

// Query exports
export {
  partnerKeys,
  clientPartnersQueryOptions,
  useClientPartnersQuery,
} from "./partners-query";
