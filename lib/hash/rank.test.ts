import { describe, expect, it } from "vitest";
import { identifyHash } from "./detect";
import { orderCandidates } from "./rank";

function candidatesFor(hash: string) {
  const result = identifyHash(hash);
  if (result.kind !== "matched") throw new Error(`Expected a match, got kind="${result.kind}"`);
  return result.candidates;
}

const MD5_OR_NTLM = "5f4dcc3b5aa765d61d8327deb882cf99"; // 32 hex chars

describe("orderCandidates", () => {
  it("defaults to prevalenceRank order when no context is given (MD5 first)", () => {
    const ordered = orderCandidates(candidatesFor(MD5_OR_NTLM));
    expect(ordered[0].signature.id).toBe("md5");
  });

  it("keeps prevalenceRank order when context is 'unknown'", () => {
    const ordered = orderCandidates(candidatesFor(MD5_OR_NTLM), { context: "unknown" });
    expect(ordered[0].signature.id).toBe("md5");
  });

  it("promotes NTLM above MD5 when context is 'windows'", () => {
    const ordered = orderCandidates(candidatesFor(MD5_OR_NTLM), { context: "windows" });
    expect(ordered[0].signature.id).toBe("ntlm");
  });

  it("keeps MD5 first when context is 'web-db'", () => {
    const ordered = orderCandidates(candidatesFor(MD5_OR_NTLM), { context: "web-db" });
    expect(ordered[0].signature.id).toBe("md5");
  });

  it("a plaintext-confirmed candidate always wins, even over a favored context", () => {
    const ordered = orderCandidates(candidatesFor(MD5_OR_NTLM), { context: "windows", confirmedId: "md5" });
    expect(ordered[0].signature.id).toBe("md5");
  });

  it("falls back to prevalenceRank among candidates with the same context-favored tier", () => {
    // Neither MD4 nor MD2 favors "windows", so they should stay in their existing prevalenceRank
    // order relative to each other even though NTLM jumps ahead of both.
    const ordered = orderCandidates(candidatesFor(MD5_OR_NTLM), { context: "windows" });
    const ids = ordered.map((c) => c.signature.id);
    expect(ids.indexOf("md4")).toBeLessThan(ids.indexOf("md2"));
  });
});
