import type { z } from "zod";

/**
 * Build a partial update schema from a create schema with validation
 * Ensures at least one field is provided to prevent empty updates
 *
 * @param schema - Base Zod schema (typically the create schema)
 * @param omitFields - Optional array of field names to omit from updates
 * @returns A partial schema with at-least-one-field validation
 *
 * @example
 * ```ts
 * const createSchema = z.object({ title: z.string(), slug: z.string() });
 * const updateSchema = buildUpdateSchema(createSchema, ['slug']);
 * // Result: partial schema without slug, requiring at least one field
 * ```
 */
export const buildUpdateSchema = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  omitFields?: (keyof T)[],
) => {
  const partial = schema.partial();
  const withOmit = omitFields
    ? partial.omit(
        Object.fromEntries(omitFields.map((f) => [f, true])) as {
          [K in keyof T]?: true;
        },
      )
    : partial;

  return withOmit.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
};
