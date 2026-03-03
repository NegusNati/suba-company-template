export const toPositiveNumber = (value: unknown): number | undefined => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

export const parseSearchId = (search: Record<string, unknown> = {}) => {
  return { id: toPositiveNumber(search.id) };
};

type ResolvePrefetchedIdOptions<TSlugResponse, TDetailResponse> = {
  rawId: unknown;
  slug: string;
  fetchBySlug: (slug: string) => Promise<TSlugResponse>;
  getIdFromSlugResponse: (response: TSlugResponse) => unknown;
  prefetchById: (id: number) => Promise<TDetailResponse>;
  missingIdMessage: string;
};

export const resolvePrefetchedSlugId = async <TSlugResponse, TDetailResponse>({
  rawId,
  slug,
  fetchBySlug,
  getIdFromSlugResponse,
  prefetchById,
  missingIdMessage,
}: ResolvePrefetchedIdOptions<TSlugResponse, TDetailResponse>) => {
  const idFromSearch = toPositiveNumber(rawId);

  if (idFromSearch) {
    await prefetchById(idFromSearch);
    return idFromSearch;
  }

  const slugResponse = await fetchBySlug(slug);
  const resolvedId = toPositiveNumber(getIdFromSlugResponse(slugResponse));

  if (!resolvedId) {
    throw new Error(missingIdMessage);
  }

  await prefetchById(resolvedId);
  return resolvedId;
};
