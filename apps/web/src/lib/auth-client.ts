import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { API_BASE_URL } from "@/lib/api-base";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/api/v1/auth",
  plugins: [adminClient()],
});
