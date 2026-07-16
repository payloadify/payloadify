import { describe, expect, it, vi } from "vitest";
import { checkDmarc } from "./dmarc";

function txtAnswer(data: string) {
  return { type: 16, data: `"${data}"` };
}

describe("checkDmarc", () => {
  it("reports not found when there's no _dmarc TXT record", async () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.found).toBe(false);
  });

  it("parses p=reject with defaults for everything else", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=reject")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.found).toBe(true);
    expect(result.policy).toBe("reject");
    expect(result.subdomainPolicy).toBe("reject");
    expect(result.subdomainPolicyInherited).toBe(true);
    expect(result.pct).toBe(100);
    expect(result.pctBelow100).toBe(false);
    expect(result.adkim).toBe("r");
    expect(result.aspf).toBe("r");
    expect(result.monitoringOnly).toBe(false);
  });

  it("flags p=none as monitoring-only", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=none")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.monitoringOnly).toBe(true);
  });

  it("uses an explicit sp= instead of inheriting from p=", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=reject; sp=quarantine")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.subdomainPolicy).toBe("quarantine");
    expect(result.subdomainPolicyInherited).toBe(false);
  });

  it("flags pct below 100", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=quarantine; pct=50")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.pct).toBe(50);
    expect(result.pctBelow100).toBe(true);
  });

  it("parses rua/ruf as comma-separated address lists", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=reject; rua=mailto:a@example.com,mailto:b@example.com; ruf=mailto:f@example.com")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.rua).toEqual(["mailto:a@example.com", "mailto:b@example.com"]);
    expect(result.ruf).toEqual(["mailto:f@example.com"]);
  });

  it("parses strict alignment modes", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=reject; adkim=s; aspf=s")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.adkim).toBe("s");
    expect(result.aspf).toBe("s");
  });

  it("flags multiple DMARC records", async () => {
    const queryFn = vi.fn().mockResolvedValue([txtAnswer("v=DMARC1; p=reject"), txtAnswer("v=DMARC1; p=none")]);
    const result = await checkDmarc("example.com", queryFn);
    expect(result.multipleRecords).toBe(true);
  });
});
