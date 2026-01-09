import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

// Base list params shared by dashboard resources
export const baseListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_LIMIT),
  search: z.string().trim().optional(),
});

type CreateListParamsOptions = {
  sortBy?: readonly [string, ...string[]];
  defaultSortBy?: string;
  extra?: z.ZodRawShape;
};

/**
 * Builds a list params schema with optional sorting and extra filters.
 * Sorting defaults to the first provided field unless `defaultSortBy` is set.
 */
export function createListParamsSchema({
  sortBy,
  defaultSortBy,
  extra,
}: CreateListParamsOptions = {}) {
  const additions: Record<string, z.ZodTypeAny> = {};

  if (sortBy && sortBy.length > 0) {
    const normalizedDefault =
      defaultSortBy && sortBy.includes(defaultSortBy)
        ? defaultSortBy
        : sortBy[0];

    additions.sortBy = z
      .enum(sortBy)
      .default(normalizedDefault as (typeof sortBy)[number]);
    additions.sortOrder = z.enum(["asc", "desc"]).default("desc");
  }

  if (extra) {
    Object.assign(additions, extra as Record<string, z.ZodTypeAny>);
  }

  return Object.keys(additions).length > 0
    ? baseListParamsSchema.extend(additions as z.ZodRawShape)
    : baseListParamsSchema;
}

/**
 * Normalizes list params by parsing with the provided schema and trimming search input.
 */
export function normalizeListParams<
  TShape extends z.ZodRawShape,
  TSchema extends z.ZodObject<TShape>,
>(schema: TSchema) {
  return (params: Partial<z.infer<TSchema>> = {}): z.infer<TSchema> => {
    const parsed = schema.parse(params);
    const search = (parsed as Record<string, unknown>).search;
    const trimmed =
      typeof search === "string" && search.trim().length > 0
        ? search.trim()
        : undefined;

    if (Object.prototype.hasOwnProperty.call(parsed, "search")) {
      return {
        ...parsed,
        search: trimmed,
      } as z.infer<TSchema>;
    }

    return parsed as z.infer<TSchema>;
  };
}
