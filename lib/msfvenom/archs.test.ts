import { describe, expect, it } from "vitest";
import { MSFVENOM_ARCHS, MSFVENOM_ARCHS_BY_ID } from "./archs";

describe("MSFVENOM_ARCHS", () => {
  it("has unique ids", () => {
    const ids = MSFVENOM_ARCHS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes x86_64 with an alias note", () => {
    const alias = MSFVENOM_ARCHS_BY_ID.x86_64;
    expect(alias).toBeDefined();
    expect(alias.description.toLowerCase()).toContain("alias");
  });

  it("every arch is reachable via MSFVENOM_ARCHS_BY_ID", () => {
    for (const a of MSFVENOM_ARCHS) {
      expect(MSFVENOM_ARCHS_BY_ID[a.id]).toBe(a);
    }
  });
});
