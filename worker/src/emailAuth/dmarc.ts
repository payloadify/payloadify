import { queryDns, stripDnsTxtQuotes, type DnsRecordType } from "../dns/doh";
import { parseTagList } from "./tagList";

const RR_TYPE_TXT = 16;

export type DnsQueryFn = (name: string, type: DnsRecordType) => Promise<{ type: number; data: string }[]>;

export type DmarcPolicy = "none" | "quarantine" | "reject";

export interface DmarcResult {
  domain: string;
  found: boolean;
  records: string[];
  record: string | null;
  multipleRecords: boolean;
  version: string | null;
  policy: DmarcPolicy | null;
  /** RFC 7489 §6.3: `sp=` inherits `p=` when absent — `subdomainPolicyInherited` tells the
   *  frontend whether this value came from an explicit `sp=` tag or was inherited. */
  subdomainPolicy: DmarcPolicy | null;
  subdomainPolicyInherited: boolean;
  pct: number;
  pctBelow100: boolean;
  rua: string[];
  ruf: string[];
  adkim: "r" | "s";
  aspf: "r" | "s";
  /** `p=none` means monitoring-only — reports are sent but nothing is enforced (RFC 7489 §6.3). */
  monitoringOnly: boolean;
}

function isValidPolicy(value: string | undefined): value is DmarcPolicy {
  return value === "none" || value === "quarantine" || value === "reject";
}

export async function checkDmarc(domain: string, queryFn: DnsQueryFn = queryDns): Promise<DmarcResult> {
  const name = `_dmarc.${domain}`;
  const answers = await queryFn(name, "TXT");
  const records = answers
    .filter((a) => a.type === RR_TYPE_TXT)
    .map((a) => stripDnsTxtQuotes(a.data))
    .filter((t) => /^v=dmarc1/i.test(t.trim()));

  const multipleRecords = records.length > 1;
  // Per RFC 7489 §6.1, a domain should publish exactly one DMARC record; if there are several,
  // mail receivers' behavior is undefined. Parse the first for a best-effort report and flag the
  // misconfiguration via `multipleRecords` rather than silently picking one as authoritative.
  const record = records[0] ?? null;

  if (!record) {
    return {
      domain,
      found: false,
      records,
      record: null,
      multipleRecords,
      version: null,
      policy: null,
      subdomainPolicy: null,
      subdomainPolicyInherited: false,
      pct: 100,
      pctBelow100: false,
      rua: [],
      ruf: [],
      adkim: "r",
      aspf: "r",
      monitoringOnly: false,
    };
  }

  const tags = parseTagList(record);
  const policyRaw = tags.get("p");
  const policy = isValidPolicy(policyRaw) ? policyRaw : null;
  const spRaw = tags.get("sp");
  const subdomainPolicyInherited = spRaw === undefined;
  const subdomainPolicy = isValidPolicy(spRaw) ? spRaw : policy;
  const pctRaw = tags.get("pct");
  const pct = pctRaw !== undefined && !Number.isNaN(Number(pctRaw)) ? Number(pctRaw) : 100;
  const splitAddresses = (value: string | undefined) => (value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []);

  return {
    domain,
    found: true,
    records,
    record,
    multipleRecords,
    version: tags.get("v") ?? null,
    policy,
    subdomainPolicy,
    subdomainPolicyInherited,
    pct,
    pctBelow100: pct < 100,
    rua: splitAddresses(tags.get("rua")),
    ruf: splitAddresses(tags.get("ruf")),
    adkim: tags.get("adkim") === "s" ? "s" : "r",
    aspf: tags.get("aspf") === "s" ? "s" : "r",
    monitoringOnly: policy === "none",
  };
}
