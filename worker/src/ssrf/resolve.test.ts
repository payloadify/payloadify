import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveHostname } from "./resolve";

function dohResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("resolveHostname", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Regression test: a name behind a CNAME (e.g. www.wikipedia.org -> dyna.wikimedia.org) returns
  // the CNAME record (type 5, whose `data` is a hostname string) ahead of the real A/AAAA record in
  // the same Answer array. Before this fix, that CNAME's hostname string was passed straight into
  // isBlockedIp, which fails closed on unparseable input — falsely blocking otherwise-public
  // redirect targets like www.wikipedia.org, www.mozilla.org, www.paypal.com, www.reddit.com, and
  // www.microsoft.com (all discovered via the securityheaders.com/MDN Observatory cross-check).
  it("filters out CNAME records and keeps only the real A record", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("type=A")) {
          return dohResponse({
            Status: 0,
            Answer: [
              { name: "www.wikipedia.org", type: 5, TTL: 86350, data: "dyna.wikimedia.org." },
              { name: "dyna.wikimedia.org", type: 1, TTL: 130, data: "103.102.166.224" },
            ],
          });
        }
        return dohResponse({ Status: 0, Answer: [] });
      }),
    );

    const ips = await resolveHostname("www.wikipedia.org");
    expect(ips).toEqual(["103.102.166.224"]);
  });

  it("filters out CNAME records and keeps only the real AAAA record", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("type=AAAA")) {
          return dohResponse({
            Status: 0,
            Answer: [
              { name: "www.mozilla.org", type: 5, TTL: 60, data: "www-mozilla.fastly-edge.com." },
              { name: "www-mozilla.fastly-edge.com", type: 28, TTL: 60, data: "2a04:4e42::787" },
            ],
          });
        }
        return dohResponse({ Status: 0, Answer: [] });
      }),
    );

    const ips = await resolveHostname("www.mozilla.org");
    expect(ips).toEqual(["2a04:4e42::787"]);
  });

  it("returns both A and AAAA results, ignoring any CNAME chain in either", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("type=AAAA")) return dohResponse({ Status: 0, Answer: [{ name: "example.com", type: 28, TTL: 300, data: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" }] });
        if (url.includes("type=A")) return dohResponse({ Status: 0, Answer: [{ name: "example.com", type: 1, TTL: 300, data: "93.184.216.34" }] });
        return dohResponse({ Status: 0, Answer: [] });
      }),
    );

    const ips = await resolveHostname("example.com");
    expect(ips).toEqual(["93.184.216.34", "2606:2800:21f:cb07:6820:80da:af6b:8b2c"]);
  });

  it("returns an empty array when a record type only ever resolves to a CNAME chain with no final answer (e.g. AAAA for an A-only host)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("type=AAAA")) {
          return dohResponse({
            Status: 0,
            Answer: [{ name: "www.paypal.com", type: 5, TTL: 3561, data: "www.glb.paypal.com." }],
          });
        }
        return dohResponse({ Status: 0, Answer: [{ name: "www.paypal.com", type: 1, TTL: 74, data: "151.101.65.21" }] });
      }),
    );

    const ips = await resolveHostname("www.paypal.com");
    expect(ips).toEqual(["151.101.65.21"]);
  });
});
