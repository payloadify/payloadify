import { describe, expect, it } from "vitest";
import { identifyHash } from "./detect";

function topCandidateName(hash: string): string {
  const result = identifyHash(hash);
  if (result.kind !== "matched") throw new Error(`Expected a match, got kind="${result.kind}"`);
  const [top] = [...result.candidates].sort((a, b) => a.signature.prevalenceRank - b.signature.prevalenceRank);
  return top.signature.name;
}

describe("identifyHash top candidate by length", () => {
  // Regression coverage: a length-40 or length-64 hash must never rank MD5 (length-32)
  // as the top candidate — each length bucket is matched and ranked independently.
  it("ranks MD5 top for a 32-character hex hash", () => {
    expect(topCandidateName("5f4dcc3b5aa765d61d8327deb882cf99")).toBe("MD5");
  });

  it("ranks SHA-1 top (not MD5) for a 40-character hex hash", () => {
    expect(topCandidateName("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8")).toBe("SHA-1");
  });

  it("ranks SHA-256 top (not MD5) for a 64-character hex hash", () => {
    expect(topCandidateName("5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8")).toBe("SHA-256");
  });
});
