import { describe, expect, it } from "vitest";
import { HEADER_RULES } from "./headerRules";

describe("HEADER_RULES", () => {
  it("has a unique id for every rule", () => {
    const ids = HEADER_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every rule has well-formed OWASP and MDN reference URLs", () => {
    for (const rule of HEADER_RULES) {
      expect(() => new URL(rule.owaspUrl)).not.toThrow();
      expect(() => new URL(rule.mdnUrl)).not.toThrow();
      expect(rule.owaspUrl.startsWith("https://owasp.org/")).toBe(true);
      expect(rule.mdnUrl.startsWith("https://developer.mozilla.org/")).toBe(true);
    }
  });

  it("every rule has a non-empty explanation", () => {
    for (const rule of HEADER_RULES) {
      expect(rule.explanation.length).toBeGreaterThan(10);
    }
  });

  it("marks exactly COOP, COEP, and CORP as informational", () => {
    const informationalIds = HEADER_RULES.filter((r) => r.informational).map((r) => r.id).sort();
    expect(informationalIds).toEqual(["coep", "coop", "corp"]);
  });
});
