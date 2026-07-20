import { describe, expect, it } from "vitest";
import {
  OWASP_CATEGORIES,
  OWASP_CATEGORIES_BY_ID,
  OWASP_WEB_2021_CWE_MAP,
  OWASP_WEB_2025_CWE_MAP,
  owaspGroupOf,
  toOwaspWebVersion,
} from "./owasp";

describe("OWASP_CATEGORIES", () => {
  it("has unique ids", () => {
    const ids = OWASP_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has a well-formed https:// owasp.org or genai.owasp.org URL", () => {
    for (const c of OWASP_CATEGORIES) {
      expect(() => new URL(c.url), c.id).not.toThrow();
      expect(c.url.startsWith("https://owasp.org/") || c.url.startsWith("https://genai.owasp.org/"), c.id).toBe(true);
    }
  });

  it("has exactly 10 Web 2025 categories", () => {
    expect(OWASP_CATEGORIES.filter((c) => owaspGroupOf(c.id) === "web-2025")).toHaveLength(10);
  });

  it("has exactly 10 LLM categories", () => {
    expect(OWASP_CATEGORIES.filter((c) => owaspGroupOf(c.id) === "llm")).toHaveLength(10);
  });
});

describe("OWASP_WEB_2025_CWE_MAP", () => {
  it("every value resolves to a real 2025 Web OWASP_CATEGORIES entry", () => {
    for (const [cwe, id] of Object.entries(OWASP_WEB_2025_CWE_MAP)) {
      expect(OWASP_CATEGORIES_BY_ID[id], `${cwe} -> "${id}"`).toBeDefined();
      expect(owaspGroupOf(id), `${cwe} -> "${id}"`).toBe("web-2025");
    }
  });
});

describe("OWASP_WEB_2021_CWE_MAP", () => {
  it("has the same CWE keys as OWASP_WEB_2025_CWE_MAP", () => {
    expect(Object.keys(OWASP_WEB_2021_CWE_MAP).sort()).toEqual(Object.keys(OWASP_WEB_2025_CWE_MAP).sort());
  });

  it("every value resolves to a real 2021 Web OWASP_CATEGORIES entry", () => {
    for (const [cwe, id] of Object.entries(OWASP_WEB_2021_CWE_MAP)) {
      expect(OWASP_CATEGORIES_BY_ID[id], `${cwe} -> "${id}"`).toBeDefined();
      expect(owaspGroupOf(id), `${cwe} -> "${id}"`).toBe("web-2021");
    }
  });
});

describe("toOwaspWebVersion", () => {
  it("translates a 2021 Web id to 2025 via its CWE", () => {
    expect(toOwaspWebVersion("web-a10-ssrf", "CWE-918", "2025")).toBe("web25-a01-broken-access-control");
    expect(toOwaspWebVersion("web-a05-security-misconfiguration", "CWE-209", "2025")).toBe("web25-a10-mishandling-exceptional-conditions");
  });

  it("translates a 2025 Web id back to 2021 via its CWE", () => {
    expect(toOwaspWebVersion("web25-a01-broken-access-control", "CWE-918", "2021")).toBe("web-a10-ssrf");
    expect(toOwaspWebVersion("web25-a10-mishandling-exceptional-conditions", "CWE-209", "2021")).toBe("web-a05-security-misconfiguration");
  });

  it("is a no-op when the id is already in the target edition", () => {
    expect(toOwaspWebVersion("web-a03-injection", "CWE-79", "2021")).toBe("web-a03-injection");
    expect(toOwaspWebVersion("web25-a05-injection", "CWE-79", "2025")).toBe("web25-a05-injection");
  });

  it("passes through api-/mobile-/llm- ids unchanged regardless of target edition", () => {
    expect(toOwaspWebVersion("api-api1-bola", "CWE-639", "2025")).toBe("api-api1-bola");
    expect(toOwaspWebVersion("mobile-m9-insecure-data-storage", "CWE-312", "2021")).toBe("mobile-m9-insecure-data-storage");
    expect(toOwaspWebVersion("llm-llm01-prompt-injection", "CWE-20", "2025")).toBe("llm-llm01-prompt-injection");
  });
});
