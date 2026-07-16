import { HEADER_RULES, type HeaderEvaluation, type HeaderRule } from "./headerRules";

export interface HeaderFinding {
  rule: HeaderRule;
  result: HeaderEvaluation;
}

/** Pure evaluation over a plain header map (lowercased keys) — no fetch, no I/O, fully unit-testable
 *  with synthetic header sets. `headers` should already be lowercased (the Worker handler does this
 *  once when reading the real Response's Headers). */
export function evaluateHeaders(headers: Record<string, string>): HeaderFinding[] {
  return HEADER_RULES.map((rule) => ({
    rule,
    result: rule.evaluate(headers[rule.headerName.toLowerCase()] ?? null, headers),
  }));
}

export interface HeaderSummary {
  totalSecurityHeaders: number;
  passingSecurityHeaders: number;
  informationDisclosureCount: number;
}

export function summarize(findings: HeaderFinding[]): HeaderSummary {
  const securityFindings = findings.filter((f) => f.rule.polarity === "present-good");
  const disclosureFindings = findings.filter((f) => f.rule.polarity === "present-bad");
  return {
    totalSecurityHeaders: securityFindings.length,
    passingSecurityHeaders: securityFindings.filter((f) => f.result.status === "pass").length,
    informationDisclosureCount: disclosureFindings.filter((f) => f.result.status === "warn").length,
  };
}
