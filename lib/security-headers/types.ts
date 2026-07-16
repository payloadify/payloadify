/** Mirrors the JSON shape returned by worker/src/securityHeaders/handler.ts. Duplicated here
 *  rather than imported across the app/worker boundary — they're separate TypeScript programs
 *  (different tsconfig, different global types) by design (see worker/tsconfig.json), so a small
 *  duplicated response-shape type is simpler and safer than reaching across that boundary. */

export type HeaderStatus = "pass" | "warn" | "missing";

export interface SecurityHeaderFinding {
  id: string;
  headerName: string;
  label: string;
  polarity: "present-good" | "present-bad";
  explanation: string;
  owaspUrl: string;
  mdnUrl: string;
  informational: boolean;
  status: HeaderStatus;
  detail: string;
  recommendation?: string;
}

export interface SecurityHeadersSummary {
  totalSecurityHeaders: number;
  passingSecurityHeaders: number;
  informationDisclosureCount: number;
}

export interface SecurityHeadersResponse {
  requestedUrl: string;
  finalUrl: string;
  redirected: boolean;
  summary: SecurityHeadersSummary;
  findings: SecurityHeaderFinding[];
  rawHeaders: Record<string, string>;
  cached: boolean;
}
