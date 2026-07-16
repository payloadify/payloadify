import { describe, expect, it, vi } from "vitest";
import { checkSpf, parseSpfMechanisms } from "./spf";

function txtAnswer(data: string) {
  return { type: 16, data: `"${data}"` };
}

describe("parseSpfMechanisms", () => {
  it("parses qualifiers, plain mechanisms, and colon/equals values", () => {
    const mechanisms = parseSpfMechanisms("v=spf1 include:_spf.example.com a mx ip4:1.2.3.4 ip6:::1 ptr:example.com redirect=example.net -all");
    expect(mechanisms).toEqual([
      { qualifier: "+", mechanism: "include", value: "_spf.example.com", raw: "include:_spf.example.com" },
      { qualifier: "+", mechanism: "a", value: undefined, raw: "a" },
      { qualifier: "+", mechanism: "mx", value: undefined, raw: "mx" },
      { qualifier: "+", mechanism: "ip4", value: "1.2.3.4", raw: "ip4:1.2.3.4" },
      { qualifier: "+", mechanism: "ip6", value: "::1", raw: "ip6:::1" },
      { qualifier: "+", mechanism: "ptr", value: "example.com", raw: "ptr:example.com" },
      { qualifier: "+", mechanism: "redirect", value: "example.net", raw: "redirect=example.net" },
      { qualifier: "-", mechanism: "all", value: undefined, raw: "-all" },
    ]);
  });

  it("parses every qualifier on all", () => {
    expect(parseSpfMechanisms("v=spf1 -all")[0].qualifier).toBe("-");
    expect(parseSpfMechanisms("v=spf1 ~all")[0].qualifier).toBe("~");
    expect(parseSpfMechanisms("v=spf1 ?all")[0].qualifier).toBe("?");
    expect(parseSpfMechanisms("v=spf1 +all")[0].qualifier).toBe("+");
    expect(parseSpfMechanisms("v=spf1 all")[0].qualifier).toBe("+");
  });
});

describe("checkSpf", () => {
  it("reports not found when there's no v=spf1 record", async () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    const result = await checkSpf("example.com", queryFn);
    expect(result.found).toBe(false);
    expect(result.record).toBeNull();
  });

  it("flags multiple SPF records and returns no usable record", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=spf1 -all"), txtAnswer("v=spf1 ~all")]);
    const result = await checkSpf("example.com", queryFn);
    expect(result.found).toBe(true);
    expect(result.multipleRecords).toBe(true);
    expect(result.record).toBeNull();
    expect(result.records).toHaveLength(2);
  });

  it("parses a single well-formed record", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=spf1 ip4:1.2.3.4 -all")]);
    const result = await checkSpf("example.com", queryFn);
    expect(result.found).toBe(true);
    expect(result.multipleRecords).toBe(false);
    expect(result.allQualifier).toBe("-");
    expect(result.lookupCount).toBe(0);
    expect(result.lookupCountExceeded).toBe(false);
  });

  it("flags deprecated ptr usage", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=spf1 ptr -all")]);
    const result = await checkSpf("example.com", queryFn);
    expect(result.deprecatedPtrUsed).toBe(true);
    expect(result.lookupCount).toBe(1);
  });

  it("counts top-level lookup mechanisms without needing recursion", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=spf1 a mx exists:%{i}._spf.example.com -all")]);
    const result = await checkSpf("example.com", queryFn);
    expect(result.lookupCount).toBe(3);
    expect(result.lookupCountExceeded).toBe(false);
    expect(result.lookupCountTruncated).toBe(false);
  });

  it("recurses fully into include chains and flags exceeding 10 lookups", async () => {
    const queryFn = vi.fn().mockImplementation(async (name: string) => {
      if (name === "example.com") {
        return [txtAnswer("v=spf1 include:a.example.com include:b.example.com include:c.example.com -all")];
      }
      // Each included domain itself costs 4 lookups (a, mx, ptr, exists).
      return [txtAnswer("v=spf1 a mx ptr exists:%{i}._spf.example.com -all")];
    });
    const result = await checkSpf("example.com", queryFn);
    // a.example.com (1 + 4) + b.example.com (1 + 4) = 10, then c.example.com's own include lookup (1)
    // pushes the running total to 11 -- past the limit, so counting stops before expanding c's chain.
    expect(result.lookupCount).toBe(11);
    expect(result.lookupCountExceeded).toBe(true);
    expect(result.lookupCountTruncated).toBe(true);
  });

  it("recurses arbitrarily deep into include chains when under the limit", async () => {
    const queryFn = vi.fn().mockImplementation(async (name: string) => {
      if (name === "example.com") return [txtAnswer("v=spf1 include:nested.example.com -all")];
      if (name === "nested.example.com") return [txtAnswer("v=spf1 include:deeper.example.com -all")];
      if (name === "deeper.example.com") return [txtAnswer("v=spf1 a -all")];
      return [txtAnswer("v=spf1 -all")];
    });
    const result = await checkSpf("example.com", queryFn);
    // top-level include (1) + nested's include (1) + deeper's "a" (1) = 3, fully resolved.
    expect(result.lookupCount).toBe(3);
    expect(result.lookupCountExceeded).toBe(false);
    expect(result.lookupCountTruncated).toBe(false);
  });

  it("detects a circular include chain and stops recursing instead of looping forever", async () => {
    const queryFn = vi.fn().mockImplementation(async (name: string) => {
      if (name === "example.com") return [txtAnswer("v=spf1 include:a.example.com -all")];
      // a.example.com includes back to the domain we started from.
      return [txtAnswer("v=spf1 include:example.com -all")];
    });
    const result = await checkSpf("example.com", queryFn);
    // top-level include (1) + a.example.com's include (1) = 2; the nested include back to
    // example.com is recognized as already-visited and not expanded again.
    expect(result.lookupCount).toBe(2);
    expect(result.lookupCountExceeded).toBe(false);
    expect(result.lookupCountTruncated).toBe(true);
  });

  it("detects a circular include even with an inconsistent trailing FQDN dot", async () => {
    const queryFn = vi.fn().mockImplementation(async (name: string) => {
      if (name === "example.com") return [txtAnswer("v=spf1 include:a.example.com. -all")];
      // a.example.com. includes back to the domain we started from, without the trailing dot.
      return [txtAnswer("v=spf1 include:example.com -all")];
    });
    const result = await checkSpf("example.com", queryFn);
    expect(result.lookupCount).toBe(2);
    expect(result.lookupCountExceeded).toBe(false);
    expect(result.lookupCountTruncated).toBe(true);
  });
});
