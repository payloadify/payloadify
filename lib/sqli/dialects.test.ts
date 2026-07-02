import { describe, expect, it } from "vitest";
import { SQL_DIALECTS_BY_ID } from "./dialects";

describe("MySQL", () => {
  const mysql = SQL_DIALECTS_BY_ID.mysql;

  it("uses a comment token with a required trailing space", () => {
    expect(mysql.lineComment).toBe("-- ");
  });

  it("is the only dialect that treats a bare hex literal as a string", () => {
    expect(mysql.hexStringLiteral).not.toBeNull();
    expect(mysql.hexStringLiteral!("a")).toBe("0x61");
  });

  it("has every info primitive available", () => {
    expect(mysql.hostname).not.toBeNull();
    expect(mysql.currentDatabase).not.toBeNull();
    expect(mysql.currentUser).not.toBeNull();
  });

  it("supports inline sleep, stacked sleep, and error-based triggers", () => {
    expect(mysql.inlineSleepCondition?.(5)).toBe("SLEEP(5)");
    expect(mysql.stackedSleepStatement?.(5)).toBe("SELECT SLEEP(5)");
    expect(mysql.errorTrigger?.("x")).toContain("EXTRACTVALUE");
  });
});

describe("MSSQL", () => {
  const mssql = SQL_DIALECTS_BY_ID.mssql;

  it("has no bare hex-literal string trick, since CONCAT() stringifies binary rather than decoding it", () => {
    expect(mssql.hexStringLiteral).toBeNull();
  });

  it("has no inline sleep condition usable inside a WHERE clause", () => {
    expect(mssql.inlineSleepCondition).toBeNull();
  });

  it("supports WAITFOR DELAY as a stacked statement", () => {
    expect(mssql.stackedSleepStatement?.(5)).toBe("WAITFOR DELAY '00:00:05'");
  });

  it("uses CONCAT() rather than + to avoid NULL propagation", () => {
    expect(mssql.concat(["a", "b"])).toBe("CONCAT(a,b)");
  });
});

describe("PostgreSQL", () => {
  const postgres = SQL_DIALECTS_BY_ID.postgresql;

  it("has no hex-literal string trick", () => {
    expect(postgres.hexStringLiteral).toBeNull();
  });

  it("uses || for concatenation", () => {
    expect(postgres.concat(["a", "b"])).toBe("a || b");
  });

  it("has an inline sleep condition and a stacked one", () => {
    expect(postgres.inlineSleepCondition?.(5)).toContain("PG_SLEEP(5)");
    expect(postgres.stackedSleepStatement?.(5)).toContain("PG_SLEEP(5)");
  });
});

describe("Oracle", () => {
  const oracle = SQL_DIALECTS_BY_ID.oracle;

  it("has no current-database concept", () => {
    expect(oracle.currentDatabase).toBeNull();
  });

  it("has no reliable sleep or error-based primitives", () => {
    expect(oracle.inlineSleepCondition).toBeNull();
    expect(oracle.stackedSleepStatement).toBeNull();
    expect(oracle.errorTrigger).toBeNull();
  });

  it("does not support stacked queries (needs a PL/SQL block, not plain SQL)", () => {
    expect(oracle.supportsStackedQueries).toBe(false);
  });
});

describe("SQLite", () => {
  const sqlite = SQL_DIALECTS_BY_ID.sqlite;

  it("has no server/user/database concepts", () => {
    expect(sqlite.hostname).toBeNull();
    expect(sqlite.currentDatabase).toBeNull();
    expect(sqlite.currentUser).toBeNull();
  });

  it("has no sleep or error-based primitives", () => {
    expect(sqlite.inlineSleepCondition).toBeNull();
    expect(sqlite.stackedSleepStatement).toBeNull();
    expect(sqlite.errorTrigger).toBeNull();
  });

  it("does not treat 0x... as a string literal (it's a hex integer in SQLite)", () => {
    expect(sqlite.hexStringLiteral).toBeNull();
  });
});

describe("charFunctionLiteral", () => {
  it("uses a single multi-arg CHAR()/char() call for MySQL, MSSQL, and SQLite", () => {
    expect(SQL_DIALECTS_BY_ID.mysql.charFunctionLiteral("ab")).toBe("CHAR(97,98)");
    expect(SQL_DIALECTS_BY_ID.mssql.charFunctionLiteral("ab")).toBe("CHAR(97,98)");
    expect(SQL_DIALECTS_BY_ID.sqlite.charFunctionLiteral("ab")).toBe("char(97,98)");
  });

  it("concatenates single-arg CHR() calls for PostgreSQL and Oracle", () => {
    expect(SQL_DIALECTS_BY_ID.postgresql.charFunctionLiteral("ab")).toBe("CHR(97)||CHR(98)");
    expect(SQL_DIALECTS_BY_ID.oracle.charFunctionLiteral("ab")).toBe("CHR(97)||CHR(98)");
  });
});
