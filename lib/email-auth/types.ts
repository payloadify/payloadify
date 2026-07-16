/** Mirrors the JSON shape returned by worker/src/emailAuth/handler.ts. Duplicated here rather than
 *  imported across the app/worker boundary, same reasoning as lib/security-headers/types.ts —
 *  they're separate TypeScript programs by design. */

export type SpfQualifier = "+" | "-" | "~" | "?";

export interface SpfMechanism {
  qualifier: SpfQualifier;
  mechanism: string;
  value?: string;
  raw: string;
}

export interface SpfResult {
  domain: string;
  found: boolean;
  records: string[];
  record: string | null;
  multipleRecords: boolean;
  mechanisms: SpfMechanism[];
  allQualifier: SpfQualifier | null;
  deprecatedPtrUsed: boolean;
  lookupCount: number;
  lookupCountExceeded: boolean;
  lookupCountTruncated: boolean;
}

export interface DkimSelectorResult {
  selector: string;
  found: boolean;
  record: string | null;
  version: string | null;
  keyType: string;
  publicKeyPresent: boolean;
  revoked: boolean;
}

export type DmarcPolicy = "none" | "quarantine" | "reject";

export interface DmarcResult {
  domain: string;
  found: boolean;
  records: string[];
  record: string | null;
  multipleRecords: boolean;
  version: string | null;
  policy: DmarcPolicy | null;
  subdomainPolicy: DmarcPolicy | null;
  subdomainPolicyInherited: boolean;
  pct: number;
  pctBelow100: boolean;
  rua: string[];
  ruf: string[];
  adkim: "r" | "s";
  aspf: "r" | "s";
  monitoringOnly: boolean;
}

export interface EmailAuthResponse {
  domain: string;
  spf: SpfResult;
  dmarc: DmarcResult;
  dkim: DkimSelectorResult[];
  dkimSelectorsChecked: number;
  cached: boolean;
}
