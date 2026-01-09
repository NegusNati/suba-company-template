const encode = (payload: unknown) =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

const decode = <T>(cursor: string): T =>
  JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as T;

export interface CursorOptions {
  cursor?: string;
  limit: number;
}

export const buildNextCursor = <T extends Record<string, unknown>>(
  items: T[],
  limit: number,
  pickValue: (item: T) => unknown,
): string | undefined => {
  if (items.length < limit) return undefined;
  const last = items[items.length - 1]!;
  const value = pickValue(last);
  return encode({ v: value });
};

export const decodeCursorValue = <T = unknown>(
  cursor?: string,
): T | undefined => (cursor ? decode<{ v: T }>(cursor).v : undefined);
