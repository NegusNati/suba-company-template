/**
 * Remove undefined values from an object
 * Keeps null values as they represent intentional field clearing
 *
 * @param obj - Object with potentially undefined values
 * @returns New object without undefined values
 *
 * @example
 * ```ts
 * stripUndefinedValues({ a: 1, b: undefined, c: null })
 * // Returns: { a: 1, c: null }
 * ```
 */
export function stripUndefinedValues<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as Partial<T>;
}
