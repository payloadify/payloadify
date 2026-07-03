import { describe, expect, it } from "vitest";
import { MSFVENOM_ENCODERS_BY_ID, NONE_ENCODER } from "./encoders";
import {
  clampIterations,
  clampPort,
  isValidFilename,
  isValidIterations,
  isValidPort,
  sanitizeFilename,
  validateLhost,
} from "./validation";

describe("validateLhost", () => {
  it("accepts valid IPv4", () => {
    expect(validateLhost("10.10.10.10")).toMatchObject({ ok: true, kind: "ipv4" });
  });

  it("rejects out-of-range IPv4 octets", () => {
    expect(validateLhost("999.1.1.1").ok).toBe(false);
  });

  it("accepts a valid hostname", () => {
    expect(validateLhost("attacker.example.com")).toMatchObject({ ok: true, kind: "hostname" });
  });

  it("rejects an invalid hostname", () => {
    expect(validateLhost("not a host!!").ok).toBe(false);
  });

  it("accepts well-formed IPv6 addresses", () => {
    const valid = ["::1", "::", "fe80::1", "2001:db8::1", "2001:0db8:0000:0000:0000:0000:0000:0001"];
    for (const v of valid) {
      expect(validateLhost(v), v).toMatchObject({ ok: true, kind: "ipv6" });
    }
  });

  it("rejects malformed IPv6 addresses", () => {
    const invalid = [":::1", "1:2:3:4:5:6:7:8:9", "fe80::1::2", "gggg::1", ":1:2:3:4:5:6:7"];
    for (const v of invalid) {
      expect(validateLhost(v).ok, v).toBe(false);
    }
  });

  it("rejects empty/whitespace input", () => {
    expect(validateLhost("").ok).toBe(false);
    expect(validateLhost("   ").ok).toBe(false);
  });
});

describe("isValidPort / clampPort", () => {
  it("validates the 1-65535 range", () => {
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(1)).toBe(true);
    expect(isValidPort(65535)).toBe(true);
    expect(isValidPort(65536)).toBe(false);
    expect(isValidPort(4.5)).toBe(false);
  });

  it("clamps out-of-range/invalid values, defaulting to 4444", () => {
    expect(clampPort(0)).toBe(1);
    expect(clampPort(70000)).toBe(65535);
    expect(clampPort(NaN)).toBe(4444);
  });
});

describe("isValidIterations / clampIterations", () => {
  it("treats any integer as valid when encoderId is none", () => {
    expect(isValidIterations(0, "none")).toBe(true);
    expect(isValidIterations(99, "none")).toBe(true);
  });

  it("enforces 1-10 when an encoder is selected", () => {
    expect(isValidIterations(1, "shikata_ga_nai")).toBe(true);
    expect(isValidIterations(10, "shikata_ga_nai")).toBe(true);
    expect(isValidIterations(0, "shikata_ga_nai")).toBe(false);
    expect(isValidIterations(11, "shikata_ga_nai")).toBe(false);
    expect(isValidIterations(4.5, "shikata_ga_nai")).toBe(false);
  });

  it("clamps into [1, encoder.maxIterations], and 0 for the none encoder", () => {
    expect(clampIterations(5, NONE_ENCODER)).toBe(0);
    const xorDynamic = MSFVENOM_ENCODERS_BY_ID.xor_dynamic;
    expect(clampIterations(99, xorDynamic)).toBe(xorDynamic.maxIterations);
    expect(clampIterations(0, xorDynamic)).toBe(1);
  });
});

describe("isValidFilename / sanitizeFilename", () => {
  it("accepts a plain filename", () => {
    expect(isValidFilename("payload_x64.exe")).toBe(true);
  });

  it("rejects shell metacharacters and empty/oversized names", () => {
    const invalid = ["a b.exe", "a;b.exe", "a|b.exe", "a&b.exe", "a`b.exe", "a$b.exe", "a/b.exe", "a\\b.exe", "a\"b.exe", "a'b.exe", ""];
    for (const v of invalid) {
      expect(isValidFilename(v), v).toBe(false);
    }
  });

  it("sanitizes by stripping disallowed characters, falling back when empty after cleanup", () => {
    expect(sanitizeFilename("pay load;.exe", "fallback.exe")).toBe("payload.exe");
    expect(sanitizeFilename(";|&`$", "fallback.exe")).toBe("fallback.exe");
  });
});
