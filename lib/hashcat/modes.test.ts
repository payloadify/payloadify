import { describe, expect, it } from "vitest";
import { HASH_SIGNATURES } from "../hash/signatures";
import { HASHCAT_MODES, HASHCAT_MODES_BY_NUMBER } from "./modes";

describe("HASHCAT_MODES", () => {
  it("includes every distinct hashcat mode referenced by the Hash Identifier's signatures", () => {
    const expectedModes = new Set(HASH_SIGNATURES.flatMap((sig) => sig.hashcatModes));
    const actualModes = new Set(HASHCAT_MODES.map((m) => m.mode));
    expect(actualModes).toEqual(expectedModes);
  });

  it("is sorted ascending by mode number", () => {
    const modeNumbers = HASHCAT_MODES.map((m) => m.mode);
    expect(modeNumbers).toEqual([...modeNumbers].sort((a, b) => a - b));
  });

  it("has no duplicate mode numbers", () => {
    const modeNumbers = HASHCAT_MODES.map((m) => m.mode);
    expect(new Set(modeNumbers).size).toBe(modeNumbers.length);
  });

  it("exposes a working lookup by mode number", () => {
    expect(HASHCAT_MODES_BY_NUMBER[0]?.name).toBe("MD5");
    expect(HASHCAT_MODES_BY_NUMBER[13100]?.name).toBe("Kerberos 5 TGS-REP etype 23 (Kerberoasting)");
  });
});
