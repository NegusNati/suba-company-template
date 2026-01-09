import { z } from "zod";

// Base pagination schema (1-100 items per page)
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Sort schema with validation
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Search schema
export const searchSchema = z.object({
  search: z.string().trim().optional(),
});

// Date range schema with ISO validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Combined base query schema
export const baseListQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema);

// Helper to parse query params from URL query string
export const parseQueryParams = <T extends z.ZodTypeAny>(
  schema: T,
  queryParams: Record<string, string | undefined>,
): z.infer<T> => {
  return schema.parse(queryParams);
};
