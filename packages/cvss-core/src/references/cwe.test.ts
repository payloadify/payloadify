import { describe, expect, it } from "vitest";
import { CWE_CATEGORY_ORDER, CWE_ENTRIES } from "./cwe";

describe("CWE_ENTRIES", () => {
  it("has unique ids matching /^CWE-\\d+$/", () => {
    const ids = CWE_ENTRIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^CWE-\d+$/);
    }
  });

  it("every entry's url matches its id", () => {
    for (const c of CWE_ENTRIES) {
      const num = c.id.replace("CWE-", "");
      expect(c.url).toBe(`https://cwe.mitre.org/data/definitions/${num}.html`);
    }
  });

  it("every entry's category is one of CWE_CATEGORY_ORDER", () => {
    for (const c of CWE_ENTRIES) {
      expect(CWE_CATEGORY_ORDER, c.id).toContain(c.category);
    }
  });

  it("every category listed in CWE_CATEGORY_ORDER has at least one entry", () => {
    for (const category of CWE_CATEGORY_ORDER) {
      expect(CWE_ENTRIES.some((c) => c.category === category), category).toBe(true);
    }
  });

  it("each category has at most one isParent entry", () => {
    for (const category of CWE_CATEGORY_ORDER) {
      const parents = CWE_ENTRIES.filter((c) => c.category === category && c.isParent);
      expect(parents.length, category).toBeLessThanOrEqual(1);
    }
  });
});
