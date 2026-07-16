import { describe, expect, it } from "vitest";
import { evaluateHeaders, summarize } from "./evaluate";

function find(findings: ReturnType<typeof evaluateHeaders>, id: string) {
  const finding = findings.find((f) => f.rule.id === id);
  if (!finding) throw new Error(`No finding for rule id "${id}"`);
  return finding;
}

describe("evaluateHeaders — HSTS", () => {
  it("flags missing HSTS", () => {
    expect(find(evaluateHeaders({}), "hsts").result.status).toBe("missing");
  });

  it("warns on a short max-age", () => {
    const result = find(evaluateHeaders({ "strict-transport-security": "max-age=100" }), "hsts").result;
    expect(result.status).toBe("warn");
  });

  it("warns on max-age=0", () => {
    const result = find(evaluateHeaders({ "strict-transport-security": "max-age=0" }), "hsts").result;
    expect(result.status).toBe("warn");
  });

  it("passes a long max-age with includeSubDomains and preload", () => {
    const result = find(
      evaluateHeaders({ "strict-transport-security": "max-age=63072000; includeSubDomains; preload" }),
      "hsts",
    ).result;
    expect(result.status).toBe("pass");
  });

  it("warns (not passes) a long max-age missing includeSubDomains/preload", () => {
    const result = find(evaluateHeaders({ "strict-transport-security": "max-age=63072000" }), "hsts").result;
    expect(result.status).toBe("warn");
  });
});

describe("evaluateHeaders — CSP", () => {
  it("flags missing CSP", () => {
    expect(find(evaluateHeaders({}), "csp").result.status).toBe("missing");
  });

  it("warns (not fails) on unsafe-inline — informational, not a hard fail", () => {
    const result = find(evaluateHeaders({ "content-security-policy": "default-src 'self'; script-src 'unsafe-inline'" }), "csp").result;
    expect(result.status).toBe("warn");
  });

  it("warns on a wildcard source", () => {
    const result = find(evaluateHeaders({ "content-security-policy": "default-src *" }), "csp").result;
    expect(result.status).toBe("warn");
  });

  it("passes a strict CSP with no wildcard/unsafe-inline/unsafe-eval", () => {
    const result = find(evaluateHeaders({ "content-security-policy": "default-src 'self'" }), "csp").result;
    expect(result.status).toBe("pass");
  });
});

describe("evaluateHeaders — X-Frame-Options / frame-ancestors", () => {
  it("flags missing XFO with no CSP frame-ancestors either", () => {
    expect(find(evaluateHeaders({}), "x-frame-options").result.status).toBe("missing");
  });

  it("passes when X-Frame-Options is DENY", () => {
    expect(find(evaluateHeaders({ "x-frame-options": "DENY" }), "x-frame-options").result.status).toBe("pass");
  });

  it("passes when XFO is absent but CSP frame-ancestors is present", () => {
    const result = find(
      evaluateHeaders({ "content-security-policy": "frame-ancestors 'none'" }),
      "x-frame-options",
    ).result;
    expect(result.status).toBe("pass");
  });
});

describe("evaluateHeaders — information-disclosure headers", () => {
  it("passes (good) when Server is absent", () => {
    expect(find(evaluateHeaders({}), "server").result.status).toBe("pass");
  });

  it("warns (bad) when Server discloses a version", () => {
    expect(find(evaluateHeaders({ server: "Apache/2.4.41 (Ubuntu)" }), "server").result.status).toBe("warn");
  });

  it("warns when X-Powered-By is present", () => {
    expect(find(evaluateHeaders({ "x-powered-by": "PHP/8.1.2" }), "x-powered-by").result.status).toBe("warn");
  });

  it("passes when X-Powered-By is absent", () => {
    expect(find(evaluateHeaders({}), "x-powered-by").result.status).toBe("pass");
  });
});

describe("summarize", () => {
  it("counts passing security headers and disclosure findings separately", () => {
    const findings = evaluateHeaders({
      "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
      "content-security-policy": "default-src 'self'",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
      server: "Apache/2.4.41",
    });
    const summary = summarize(findings);
    expect(summary.passingSecurityHeaders).toBeGreaterThanOrEqual(4);
    expect(summary.informationDisclosureCount).toBe(1);
  });
});
