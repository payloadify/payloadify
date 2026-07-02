import { describe, expect, it } from "vitest";
import { SQL_DIALECTS_BY_ID } from "./dialects";
import { SQLI_OBFUSCATIONS_BY_ID } from "./obfuscation";

const QUOTE = "'";

describe("hex-literal-strings", () => {
  const obfuscation = SQLI_OBFUSCATIONS_BY_ID["hex-literal-strings"];

  it("applies only on MySQL", () => {
    expect(obfuscation.apply("CONCAT('a','b')", SQL_DIALECTS_BY_ID.mysql, QUOTE)).toBe("CONCAT(0x61,0x62)");
  });

  it("returns null on every other dialect", () => {
    for (const id of ["mssql", "postgresql", "oracle", "sqlite"] as const) {
      expect(obfuscation.apply("CONCAT('a','b')", SQL_DIALECTS_BY_ID[id], QUOTE)).toBeNull();
    }
  });
});

describe("char-code-strings", () => {
  const obfuscation = SQLI_OBFUSCATIONS_BY_ID["char-code-strings"];

  it("rewrites a quoted literal via the dialect's char function on every dialect", () => {
    expect(obfuscation.apply("'a'", SQL_DIALECTS_BY_ID.mysql, QUOTE)).toBe("CHAR(97)");
    expect(obfuscation.apply("'a'", SQL_DIALECTS_BY_ID.postgresql, QUOTE)).toBe("CHR(97)");
  });

  it("is a no-op when there's no string literal to rewrite", () => {
    expect(obfuscation.apply("@@version", SQL_DIALECTS_BY_ID.mysql, QUOTE)).toBe("@@version");
  });
});

describe("case-alternation", () => {
  const obfuscation = SQLI_OBFUSCATIONS_BY_ID["case-alternation"];

  it("alternates case on letters only, leaving other characters untouched", () => {
    expect(obfuscation.apply("abc(1)", SQL_DIALECTS_BY_ID.mysql, QUOTE)).toBe("aBc(1)");
  });
});

describe("whitespace-to-comment", () => {
  const obfuscation = SQLI_OBFUSCATIONS_BY_ID["whitespace-to-comment"];

  it("replaces every space with an inline comment", () => {
    expect(obfuscation.apply("a b c", SQL_DIALECTS_BY_ID.mysql, QUOTE)).toBe("a/**/b/**/c");
  });
});

describe("none", () => {
  it("always applies, unchanged", () => {
    for (const dialect of Object.values(SQL_DIALECTS_BY_ID)) {
      expect(SQLI_OBFUSCATIONS_BY_ID["none"].apply("x", dialect, QUOTE)).toBe("x");
    }
  });
});
