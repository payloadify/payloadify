import { describe, expect, it } from "vitest";
import { unavoidableChars } from "./blacklist";
import { SQL_DIALECTS_BY_ID } from "./dialects";
import { buildPayload, effectiveLevel, pickTechniqueAndObfuscation } from "./generate";
import { NONE_SQLI_OBFUSCATION, SQLI_OBFUSCATIONS_BY_ID } from "./obfuscation";
import { SQLI_TECHNIQUES_BY_ID } from "./techniques";

describe("pickTechniqueAndObfuscation", () => {
  it("never returns a technique whose render is unsupported on the given dialect", () => {
    for (let i = 0; i < 50; i++) {
      const { technique, obfuscation } = pickTechniqueAndObfuscation(
        "advanced",
        "string",
        true,
        SQL_DIALECTS_BY_ID.sqlite,
        "sqlite_version()",
        1,
        new Set(),
      );
      // SQLite has no error-based, time-based, or stacked-queries support at the advanced level —
      // only boolean-blind should ever be selected here.
      expect(technique.id).toBe("boolean-blind");
      expect(obfuscation).toBeDefined();
    }
  });

  it("honors a fixed technique while still randomizing obfuscation", () => {
    const fixed = SQLI_TECHNIQUES_BY_ID["union-select"];
    for (let i = 0; i < 20; i++) {
      const { technique } = pickTechniqueAndObfuscation(
        "intermediate",
        "string",
        false,
        SQL_DIALECTS_BY_ID.mysql,
        "@@version",
        1,
        new Set(),
        fixed,
      );
      expect(technique.id).toBe("union-select");
    }
  });

  it("forces obfuscation to none for techniques that don't use the info expression", () => {
    const fixed = SQLI_TECHNIQUES_BY_ID["tautology"];
    for (let i = 0; i < 20; i++) {
      const { obfuscation } = pickTechniqueAndObfuscation(
        "basic",
        "string",
        false,
        SQL_DIALECTS_BY_ID.mysql,
        null,
        1,
        new Set(),
        fixed,
      );
      expect(obfuscation.id).toBe("none");
    }
  });

  it("prefers a combination that fully avoids the blacklist over one that reports violations", () => {
    // Numeric context has no breakout quote of its own, so blacklisting "'" here only pressures
    // the picker to obfuscate the quote inside the info expression itself (via char-code-strings
    // or MySQL's hex-literal-strings) rather than being an unavoidable universal violation.
    for (let i = 0; i < 30; i++) {
      const { technique, obfuscation } = pickTechniqueAndObfuscation(
        "advanced",
        "numeric",
        true,
        SQL_DIALECTS_BY_ID.mysql,
        "'a'",
        1,
        new Set(["'"]),
      );
      const result = buildPayload(technique, obfuscation, SQL_DIALECTS_BY_ID.mysql, "'a'", "numeric", 1, new Set(["'"]));
      expect(result.violations).toEqual([]);
    }
  });

  it("throws when no technique is available at all for the given context/dialect/level", () => {
    // At the advanced level on SQLite with no info expression to extract, every advanced
    // technique's render returns null (error-based/time-based/stacked are all unsupported on
    // SQLite outright, and boolean-blind additionally needs a non-null info expression).
    expect(() => pickTechniqueAndObfuscation("advanced", "string", true, SQL_DIALECTS_BY_ID.sqlite, null, 1, new Set())).toThrow();
  });
});

describe("effectiveLevel", () => {
  it("takes the higher-ranked of technique and obfuscation level", () => {
    const basicTechnique = SQLI_TECHNIQUES_BY_ID["tautology"];
    const advancedObfuscation = SQLI_OBFUSCATIONS_BY_ID["hex-literal-strings"];
    expect(effectiveLevel(basicTechnique, advancedObfuscation)).toBe("advanced");
    expect(effectiveLevel(basicTechnique, NONE_SQLI_OBFUSCATION)).toBe("basic");
  });
});

describe("buildPayload", () => {
  it("substitutes the extraction expression with no obfuscation", () => {
    const technique = SQLI_TECHNIQUES_BY_ID["union-select"];
    const result = buildPayload(technique, NONE_SQLI_OBFUSCATION, SQL_DIALECTS_BY_ID.mysql, "@@version", "string", 1, new Set());
    expect(result.payload).toBe("' UNION SELECT @@version-- ");
    expect(result.violations).toEqual([]);
  });

  it("reports remaining violations when no combination fully avoids the blacklist", () => {
    const technique = SQLI_TECHNIQUES_BY_ID["union-select"];
    const result = buildPayload(technique, NONE_SQLI_OBFUSCATION, SQL_DIALECTS_BY_ID.mysql, "@@version", "string", 1, new Set(["'"]));
    expect(result.violations).toEqual(["'"]);
  });

  it("falls back to the unobfuscated expression when the obfuscation doesn't apply", () => {
    const technique = SQLI_TECHNIQUES_BY_ID["union-select"];
    const hexLiteral = SQLI_OBFUSCATIONS_BY_ID["hex-literal-strings"];
    const result = buildPayload(technique, hexLiteral, SQL_DIALECTS_BY_ID.postgresql, "'a'", "string", 1, new Set());
    expect(result.obfuscationApplied).toBe(false);
    expect(result.payload).toContain("'a'");
  });

  it("throws when the technique is unsupported on the given dialect", () => {
    const technique = SQLI_TECHNIQUES_BY_ID["error-based"];
    expect(() => buildPayload(technique, NONE_SQLI_OBFUSCATION, SQL_DIALECTS_BY_ID.sqlite, "x", "string", 1, new Set())).toThrow();
  });
});

describe("unavoidableChars", () => {
  it("flags quote characters as unavoidable when char-code obfuscation still needs them for other literals", () => {
    const result = unavoidableChars(SQLI_OBFUSCATIONS_BY_ID["none"], SQL_DIALECTS_BY_ID.mysql, "'a'");
    expect(result.has("'")).toBe(true);
  });

  it("does not flag quotes once char-code-strings has removed them entirely", () => {
    const result = unavoidableChars(SQLI_OBFUSCATIONS_BY_ID["char-code-strings"], SQL_DIALECTS_BY_ID.mysql, "'a'");
    expect(result.has("'")).toBe(false);
  });

  it("returns an empty set when there's no info expression to probe", () => {
    const result = unavoidableChars(SQLI_OBFUSCATIONS_BY_ID["none"], SQL_DIALECTS_BY_ID.mysql, null);
    expect(result.size).toBe(0);
  });
});
