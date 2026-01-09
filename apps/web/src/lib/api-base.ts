const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.replace(/\/$/, "");
  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    trimmed,
  );
  if (trimmed.startsWith("http://") && !isLocalhost) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  return trimmed;
};

const resolveBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_SERVER_URL ?? "";
  const runtimeBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = envBaseUrl || runtimeBaseUrl;
  return normalizeBaseUrl(baseUrl);
};

export const API_BASE_URL = resolveBaseUrl();
