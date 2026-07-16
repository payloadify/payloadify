import { describe, expect, it, vi } from "vitest";
import { checkDkimSelector, checkDkim } from "./dkim";

function txtAnswer(data: string) {
  return { type: 16, data: `"${data}"` };
}

describe("checkDkimSelector", () => {
  it("reports not found when there's no record at the selector", async () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    const result = await checkDkimSelector("example.com", "default", queryFn);
    expect(result.found).toBe(false);
    expect(result.selector).toBe("default");
  });

  it("parses a well-formed record, defaulting key type to rsa when k= is absent", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DKIM1; p=MIGfMA0GCSq...")]);
    const result = await checkDkimSelector("example.com", "google", queryFn);
    expect(result.found).toBe(true);
    expect(result.version).toBe("DKIM1");
    expect(result.keyType).toBe("rsa");
    expect(result.publicKeyPresent).toBe(true);
    expect(result.revoked).toBe(false);
  });

  it("treats an absent v= tag as present-by-default per RFC 6376, not a parse failure", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("k=rsa; p=MIGfMA0GCSq...")]);
    const result = await checkDkimSelector("example.com", "s1", queryFn);
    expect(result.found).toBe(true);
    expect(result.version).toBeNull();
    expect(result.publicKeyPresent).toBe(true);
  });

  it("flags an empty p= as a revoked key, not just found", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DKIM1; p=")]);
    const result = await checkDkimSelector("example.com", "old", queryFn);
    expect(result.found).toBe(true);
    expect(result.publicKeyPresent).toBe(false);
    expect(result.revoked).toBe(true);
  });
});

describe("checkDkim", () => {
  it("checks every selector in parallel and returns one result per selector", async () => {
    const queryFn = vi.fn().mockImplementation(async (name: string) => {
      if (name.startsWith("google.")) return [txtAnswer("v=DKIM1; p=abc")];
      return [];
    });
    const results = await checkDkim("example.com", ["default", "google"], queryFn);
    expect(results).toHaveLength(2);
    expect(results.find((r) => r.selector === "google")?.found).toBe(true);
    expect(results.find((r) => r.selector === "default")?.found).toBe(false);
  });
});
