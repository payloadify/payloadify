import { describe, expect, it } from "vitest";
import { validateUrl } from "./validateUrl";

const publicResolver = async () => ["93.184.216.34"];
const privateResolver = async () => ["10.0.0.1"];
const mixedResolver = async () => ["93.184.216.34", "127.0.0.1"]; // one public, one private — must still block
const failingResolver = async (): Promise<string[]> => {
  throw new Error("DoH query failed: 500");
};
const emptyResolver = async () => [];

describe("validateUrl", () => {
  it("rejects empty input", async () => {
    expect(await validateUrl("", publicResolver)).toEqual({ ok: false, reason: "no-input" });
    expect(await validateUrl("   ", publicResolver)).toEqual({ ok: false, reason: "no-input" });
  });

  it("defaults to https when no scheme is given", async () => {
    const result = await validateUrl("example.com", publicResolver);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.url.protocol).toBe("https:");
  });

  it("accepts an explicit http scheme", async () => {
    const result = await validateUrl("http://example.com", publicResolver);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.url.protocol).toBe("http:");
  });

  it("rejects non-http(s) schemes", async () => {
    expect(await validateUrl("file:///etc/passwd", publicResolver)).toEqual({ ok: false, reason: "invalid-scheme" });
    expect(await validateUrl("ftp://example.com", publicResolver)).toEqual({ ok: false, reason: "invalid-scheme" });
    expect(await validateUrl("gopher://example.com", publicResolver)).toEqual({ ok: false, reason: "invalid-scheme" });
  });

  it("rejects an unparseable URL", async () => {
    expect(await validateUrl("http://", publicResolver)).toEqual({ ok: false, reason: "invalid-url" });
  });

  it("allows a hostname that resolves to a public IP", async () => {
    const result = await validateUrl("https://example.com", publicResolver);
    expect(result).toEqual({ ok: true, url: new URL("https://example.com"), ip: "93.184.216.34" });
  });

  it("blocks a hostname that resolves to a private IP", async () => {
    expect(await validateUrl("https://internal.example.com", privateResolver)).toEqual({
      ok: false,
      reason: "blocked-range",
    });
  });

  it("blocks if ANY resolved IP is private, even if another is public", async () => {
    expect(await validateUrl("https://example.com", mixedResolver)).toEqual({ ok: false, reason: "blocked-range" });
  });

  it("blocks a direct private IPv4 literal without calling the resolver", async () => {
    let called = false;
    const spyResolver = async () => {
      called = true;
      return ["8.8.8.8"];
    };
    expect(await validateUrl("http://127.0.0.1/", spyResolver)).toEqual({ ok: false, reason: "blocked-range" });
    expect(called).toBe(false);
  });

  it("blocks the cloud metadata IP as a direct literal", async () => {
    expect(await validateUrl("http://169.254.169.254/", publicResolver)).toEqual({
      ok: false,
      reason: "blocked-range",
    });
  });

  it("allows a direct public IPv4 literal", async () => {
    const result = await validateUrl("http://8.8.8.8/", publicResolver);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ip).toBe("8.8.8.8");
  });

  it("blocks a bracketed IPv6 loopback literal", async () => {
    expect(await validateUrl("http://[::1]/", publicResolver)).toEqual({ ok: false, reason: "blocked-range" });
  });

  it("reports dns-failure when resolution throws", async () => {
    expect(await validateUrl("https://example.com", failingResolver)).toEqual({ ok: false, reason: "dns-failure" });
  });

  it("reports dns-failure when resolution returns no records", async () => {
    expect(await validateUrl("https://nonexistent.example.com", emptyResolver)).toEqual({
      ok: false,
      reason: "dns-failure",
    });
  });
});
