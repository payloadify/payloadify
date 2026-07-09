import { describe, expect, it } from "vitest";
import { applyAlgToHeaderJson, applyQuickClaim, formatRelativeFromNow, toNumericDate } from "./claims";

describe("toNumericDate", () => {
  it("converts a Date to epoch seconds (floor of ms/1000)", () => {
    expect(toNumericDate(new Date(1700000000123))).toBe(1700000000);
  });
});

describe("applyQuickClaim", () => {
  it("adds a claim to an empty payload", () => {
    const result = applyQuickClaim("", "sub", "user-1");
    expect(JSON.parse(result)).toEqual({ sub: "user-1" });
  });

  it("sets a claim while preserving existing claims", () => {
    const start = JSON.stringify({ sub: "user-1", iat: 100 });
    const result = applyQuickClaim(start, "exp", 200);
    expect(JSON.parse(result)).toEqual({ sub: "user-1", iat: 100, exp: 200 });
  });

  it("overwrites an existing claim of the same key", () => {
    const start = JSON.stringify({ sub: "user-1" });
    const result = applyQuickClaim(start, "sub", "user-2");
    expect(JSON.parse(result)).toEqual({ sub: "user-2" });
  });

  it("throws a clear error on malformed input JSON", () => {
    expect(() => applyQuickClaim("{not json", "sub", "user-1")).toThrow(/not valid JSON/);
  });
});

describe("applyAlgToHeaderJson", () => {
  it("sets alg and defaults typ to JWT when absent, on an empty header", () => {
    const result = applyAlgToHeaderJson("", "HS256");
    expect(JSON.parse(result)).toEqual({ alg: "HS256", typ: "JWT" });
  });

  it("preserves an existing typ instead of overwriting it", () => {
    const start = JSON.stringify({ alg: "HS256", typ: "custom+jwt" });
    const result = applyAlgToHeaderJson(start, "RS256");
    expect(JSON.parse(result)).toEqual({ alg: "RS256", typ: "custom+jwt" });
  });

  it("preserves other header fields like kid", () => {
    const start = JSON.stringify({ alg: "HS256", typ: "JWT", kid: "key-1" });
    const result = applyAlgToHeaderJson(start, "RS256");
    expect(JSON.parse(result)).toEqual({ alg: "RS256", typ: "JWT", kid: "key-1" });
  });
});

describe("formatRelativeFromNow", () => {
  const now = 1700000000000;

  it("formats a future timestamp as 'expires in'", () => {
    expect(formatRelativeFromNow(1700000000 + 3600 + 900, now)).toBe("expires in 1h 15m");
  });

  it("formats a past timestamp as 'expired ... ago'", () => {
    expect(formatRelativeFromNow(1700000000 - 7200, now)).toBe("expired 2h ago");
  });

  it("formats sub-minute differences as 'less than a minute'", () => {
    expect(formatRelativeFromNow(1700000000 + 30, now)).toBe("expires in less than a minute");
  });

  it("formats multi-day durations with day+hour parts", () => {
    expect(formatRelativeFromNow(1700000000 + 86400 * 2 + 3600 * 5, now)).toBe("expires in 2d 5h");
  });
});
