import { describe, expect, it } from "vitest";
import { identifyHomoglyphs } from "./identify";

describe("identifyHomoglyphs", () => {
  it("flags a Cyrillic а (U+0430) as confusable with Latin a", () => {
    const [flagged] = identifyHomoglyphs("а");
    expect(flagged.codePoint).toBe("U+0430");
    expect(flagged.script).toBe("Cyrillic");
    expect(flagged.impersonates).toBe("a");
  });

  it("flags only the confusable character in a mixed-script domain-like string", () => {
    const flagged = identifyHomoglyphs("pаypal");
    expect(flagged).toHaveLength(1);
    expect(flagged[0].index).toBe(1);
    expect(flagged[0].char).toBe("а");
  });

  it("returns no matches for plain ASCII text with no confusable characters", () => {
    expect(identifyHomoglyphs("wikipedia.org")).toEqual([]);
  });

  it("returns no matches for an empty string", () => {
    expect(identifyHomoglyphs("")).toEqual([]);
  });

  it("does not flag a plain 'm'", () => {
    expect(identifyHomoglyphs("m")).toEqual([]);
  });

  it("flags 'rn' as impersonating 'm', not the other way around", () => {
    const flagged = identifyHomoglyphs("rn");
    expect(flagged).toHaveLength(1);
    expect(flagged[0].char).toBe("rn");
    expect(flagged[0].impersonates).toBe("m");
  });

  it("flags 'rn' within a word without flagging the rest", () => {
    const flagged = identifyHomoglyphs("modern");
    expect(flagged).toHaveLength(1);
    expect(flagged[0].index).toBe(4);
    expect(flagged[0].char).toBe("rn");
    expect(flagged[0].impersonates).toBe("m");
  });
});
