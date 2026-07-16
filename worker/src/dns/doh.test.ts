import { afterEach, describe, expect, it, vi } from "vitest";
import { queryDns, stripDnsTxtQuotes } from "./doh";

describe("stripDnsTxtQuotes", () => {
  it("strips a single quoted segment", () => {
    expect(stripDnsTxtQuotes('"v=spf1 include:_spf.example.com ~all"')).toBe(
      "v=spf1 include:_spf.example.com ~all",
    );
  });

  it("concatenates multiple quoted segments (long TXT records split across chunks)", () => {
    expect(stripDnsTxtQuotes('"v=DKIM1; k=rsa; " "p=MIIBIjANBg..."')).toBe(
      "v=DKIM1; k=rsa; p=MIIBIjANBg...",
    );
  });

  it("unescapes an internal escaped quote", () => {
    expect(stripDnsTxtQuotes('"a=\\"quoted\\" value"')).toBe('a="quoted" value');
  });

  it("returns the input unchanged if there are no quotes", () => {
    expect(stripDnsTxtQuotes("v=spf1 -all")).toBe("v=spf1 -all");
  });
});

describe("queryDns", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the Answer array from a successful DoH response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ Status: 0, Answer: [{ name: "example.com.", type: 16, TTL: 300, data: '"v=spf1 -all"' }] }), {
            status: 200,
          }),
      ),
    );
    const answers = await queryDns("example.com", "TXT");
    expect(answers).toHaveLength(1);
    expect(answers[0].data).toBe('"v=spf1 -all"');
  });

  it("returns an empty array when there is no Answer field (e.g. NXDOMAIN)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ Status: 3 }), { status: 200 })));
    expect(await queryDns("nonexistent.example.com", "A")).toEqual([]);
  });

  it("throws on a non-2xx transport failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    await expect(queryDns("example.com", "A")).rejects.toThrow();
  });
});
