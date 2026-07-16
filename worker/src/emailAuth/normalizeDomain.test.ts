import { describe, expect, it } from "vitest";
import { normalizeDomain } from "./normalizeDomain";

describe("normalizeDomain", () => {
  it("accepts a bare domain", () => {
    expect(normalizeDomain("example.com")).toEqual({ ok: true, domain: "example.com" });
  });

  it("lowercases the domain", () => {
    expect(normalizeDomain("Example.COM")).toEqual({ ok: true, domain: "example.com" });
  });

  it("strips a scheme, path, query, and port from a pasted URL", () => {
    expect(normalizeDomain("https://example.com:8443/mail?x=1")).toEqual({ ok: true, domain: "example.com" });
  });

  it("strips a trailing dot", () => {
    expect(normalizeDomain("example.com.")).toEqual({ ok: true, domain: "example.com" });
  });

  it("rejects empty input", () => {
    expect(normalizeDomain("   ")).toEqual({ ok: false, reason: "empty" });
  });

  it("rejects an invalid domain", () => {
    expect(normalizeDomain("not a domain")).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects a domain with no TLD", () => {
    expect(normalizeDomain("localhost")).toEqual({ ok: false, reason: "invalid" });
  });
});
