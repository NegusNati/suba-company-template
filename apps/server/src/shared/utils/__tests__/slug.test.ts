import { describe, it, expect } from "bun:test";

import { generateSlug, ensureUniqueSlug } from "../slug";

describe("generateSlug", () => {
  it("converts text to lowercase with hyphens", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello, World! @#$%")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("Hello   World   Test")).toBe("hello-world-test");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("Hello---World")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("---Hello World---")).toBe("hello-world");
  });

  it("handles unicode and diacritics", () => {
    expect(generateSlug("Café Münchën")).toBe("cafe-munchen");
  });

  it("handles already slug-like strings", () => {
    expect(generateSlug("hello-world-123")).toBe("hello-world-123");
  });
});

describe("ensureUniqueSlug", () => {
  it("returns original slug if not taken", async () => {
    const slug = await ensureUniqueSlug("test-slug", async () => false);
    expect(slug).toBe("test-slug");
  });

  it("appends -2 if slug exists", async () => {
    let checkCount = 0;
    const slug = await ensureUniqueSlug("test-slug", async (s) => {
      checkCount++;
      return s === "test-slug";
    });
    expect(slug).toBe("test-slug-2");
    expect(checkCount).toBe(2);
  });

  it("finds first available suffix", async () => {
    const slug = await ensureUniqueSlug("test-slug", async (s) => {
      return s === "test-slug" || s === "test-slug-2";
    });
    expect(slug).toBe("test-slug-3");
  });
});
