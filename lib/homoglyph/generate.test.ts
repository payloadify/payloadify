import { describe, expect, it } from "vitest";
import { applySelections, getAlternativesFor, randomizeText } from "./generate";

// U+E000 is in the Private Use Area — guaranteed absent from confusables.txt, so it's a
// reliable "definitely has no confusable" fixture.
const NO_CONFUSABLE_CHAR = "";

describe("getAlternativesFor", () => {
  it("includes Cyrillic а as an alternative for Latin a", () => {
    const alternatives = getAlternativesFor("a");
    expect(alternatives.some((alt) => alt.char === "а" && alt.codePoint === "U+0430")).toBe(true);
  });

  it("returns an empty list for a character with no known confusable", () => {
    expect(getAlternativesFor(NO_CONFUSABLE_CHAR)).toEqual([]);
  });
});

describe("randomizeText", () => {
  it("only substitutes characters that have alternatives, keeping character count the same", () => {
    const { output, substitutions } = randomizeText(`a${NO_CONFUSABLE_CHAR}`);
    // Some replacements are astral (outside the BMP, e.g. mathematical alphanumeric symbols),
    // so compare code-point count rather than UTF-16 .length.
    expect(Array.from(output)).toHaveLength(2);
    expect(substitutions).toHaveLength(1);
    expect(substitutions[0].index).toBe(0);
    expect(substitutions[0].original).toBe("a");
  });

  it("leaves text with no eligible characters unchanged", () => {
    const text = NO_CONFUSABLE_CHAR.repeat(3);
    const { output, substitutions } = randomizeText(text);
    expect(output).toBe(text);
    expect(substitutions).toEqual([]);
  });
});

describe("applySelections", () => {
  it("applies a chosen replacement at the given index only", () => {
    const { output, substitutions } = applySelections("abc", new Map([[1, "б"]]));
    expect(output).toBe("aбc");
    expect(substitutions).toEqual([{ index: 1, original: "b", replacement: "б" }]);
  });

  it("returns the original text unchanged when no selections are made", () => {
    const { output, substitutions } = applySelections("abc", new Map());
    expect(output).toBe("abc");
    expect(substitutions).toEqual([]);
  });
});
