import { describe, expect, it } from "bun:test";

import { buildNextCursor, decodeCursorValue } from "../shared/query/cursor";

describe("cursor helpers", () => {
  it("encodes and decodes nextCursor", () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const next = buildNextCursor(items, 3, (i) => i.id);
    expect(next).toBeDefined();
    const value = decodeCursorValue<number>(next);
    expect(value).toBe(3);
  });

  it("returns undefined when fewer than limit", () => {
    const items = [{ id: 1 }];
    const next = buildNextCursor(items, 3, (i) => i.id);
    expect(next).toBeUndefined();
  });
});
