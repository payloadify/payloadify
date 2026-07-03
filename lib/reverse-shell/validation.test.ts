import { describe, expect, it } from "vitest";
import { clampPort, defaultListener, isValidPort, validateHost } from "./validation";

describe("isValidPort", () => {
  it("rejects 0 and accepts the boundaries 1 and 65535", () => {
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(1)).toBe(true);
    expect(isValidPort(65535)).toBe(true);
  });

  it("rejects 65536 and non-integers", () => {
    expect(isValidPort(65536)).toBe(false);
    expect(isValidPort(4444.5)).toBe(false);
  });
});

describe("clampPort", () => {
  it("clamps out-of-range values into 1..65535", () => {
    expect(clampPort(0)).toBe(1);
    expect(clampPort(-5)).toBe(1);
    expect(clampPort(70000)).toBe(65535);
  });

  it("falls back to 4444 for non-finite input", () => {
    expect(clampPort(NaN)).toBe(4444);
  });
});

describe("validateHost", () => {
  it("accepts a valid IPv4 address", () => {
    expect(validateHost("10.10.10.10")).toEqual({ ok: true, kind: "ipv4" });
  });

  it("rejects an IPv4 address with an out-of-range octet", () => {
    const result = validateHost("999.1.1.1");
    expect(result.ok).toBe(false);
    expect(result.kind).toBe("invalid");
  });

  it("accepts a valid hostname", () => {
    expect(validateHost("attacker.example.com")).toEqual({ ok: true, kind: "hostname" });
  });

  it("rejects garbage input", () => {
    const result = validateHost("not a host!!");
    expect(result.ok).toBe(false);
  });

  it("rejects IPv6 input explicitly, with a clear message rather than silently mangling it", () => {
    const result = validateHost("::1");
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/IPv6/);
  });

  it("rejects empty input", () => {
    const result = validateHost("   ");
    expect(result.ok).toBe(false);
  });
});

describe("defaultListener", () => {
  it("produces an nc listener command for the given port", () => {
    expect(defaultListener(4444)).toBe("nc -lvnp 4444");
  });
});
