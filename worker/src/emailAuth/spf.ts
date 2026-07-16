import { queryDns, stripDnsTxtQuotes, type DnsRecordType } from "../dns/doh";

const RR_TYPE_TXT = 16;

/** RFC 7208 §4.6.4 — mechanisms that cost a DNS lookup against the 10-lookup budget. `ip4`/`ip6`
 *  are free (no lookup); `all` is a qualifier target, not a lookup. */
const LOOKUP_MECHANISMS = new Set(["a", "mx", "ptr", "include", "exists", "redirect"]);

/** RFC 7208 §4.6.4 — once total lookups exceed this, the record is a PermError. Used both to
 *  report `lookupCountExceeded` and to short-circuit further recursion: past this point the
 *  record has already failed, so there's no need to keep resolving nested includes to get an
 *  exact total. */
const SPF_LOOKUP_LIMIT = 10;

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
  /** True if counting stopped before fully resolving every nested include/redirect — either
   *  because the running total already exceeded SPF_LOOKUP_LIMIT (the record is already a
   *  PermError, so an exact final count doesn't matter) or because a circular include chain was
   *  detected. The count above is a floor, not exact, in that case. */
  lookupCountTruncated: boolean;
}

export type DnsQueryFn = (name: string, type: DnsRecordType) => Promise<{ type: number; data: string }[]>;

function isSpfRecord(text: string): boolean {
  return /^v=spf1(\s|$)/i.test(text.trim());
}

async function fetchSpfTexts(domain: string, queryFn: DnsQueryFn): Promise<string[]> {
  const answers = await queryFn(domain, "TXT");
  return answers
    .filter((a) => a.type === RR_TYPE_TXT)
    .map((a) => stripDnsTxtQuotes(a.data))
    .filter(isSpfRecord);
}

/** Tokenizes everything after the leading `v=spf1` tag into qualifier + mechanism + value triples.
 *  Handles both `:`-delimited mechanisms (`include:example.com`, `ip4:1.2.3.4`) and `=`-delimited
 *  modifiers (`redirect=example.com`, `exp=explain.example.com`). */
export function parseSpfMechanisms(record: string): SpfMechanism[] {
  const tokens = record.trim().split(/\s+/).slice(1);
  const mechanisms: SpfMechanism[] = [];
  for (const token of tokens) {
    if (!token) continue;
    const qualifierMatch = token.match(/^([+\-~?])/);
    const qualifier = (qualifierMatch ? qualifierMatch[1] : "+") as SpfQualifier;
    const rest = qualifierMatch ? token.slice(1) : token;
    const delimIndex = rest.search(/[:=]/);
    const mechanism = (delimIndex === -1 ? rest : rest.slice(0, delimIndex)).toLowerCase();
    const value = delimIndex === -1 ? undefined : rest.slice(delimIndex + 1);
    mechanisms.push({ qualifier, mechanism, value, raw: token });
  }
  return mechanisms;
}

interface LookupCountState {
  count: number;
  truncated: boolean;
}

/** Normalizes a domain for `visited`-set comparison: lowercase, trimmed, and with a trailing
 *  FQDN root-label dot stripped (`example.com.` and `example.com` refer to the same domain). */
function normalizeDomainForVisited(domain: string): string {
  const trimmed = domain.trim().toLowerCase();
  return trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
}

/** Recursively expands include:/redirect= chains, tallying total DNS lookups against the RFC
 *  7208 §4.6.4 budget of 10. `visited` tracks every domain already expanded (seeded with the
 *  starting domain) so a circular include chain (A includes B, B includes A) can't recurse
 *  forever. Stops early — without walking the rest of the tree — as soon as the running count
 *  passes SPF_LOOKUP_LIMIT, since the record is already a PermError at that point and an exact
 *  total past the limit isn't needed. Both stopping conditions set `truncated`, since in either
 *  case the reported count is a floor rather than an exact total. */
async function countSpfLookups(
  mechanisms: SpfMechanism[],
  queryFn: DnsQueryFn,
  visited: Set<string>,
  state: LookupCountState,
): Promise<void> {
  for (const m of mechanisms) {
    if (state.count > SPF_LOOKUP_LIMIT) {
      state.truncated = true;
      return;
    }
    if (!LOOKUP_MECHANISMS.has(m.mechanism)) continue;
    state.count += 1;

    if ((m.mechanism === "include" || m.mechanism === "redirect") && m.value) {
      if (state.count > SPF_LOOKUP_LIMIT) {
        state.truncated = true;
        return;
      }

      const target = normalizeDomainForVisited(m.value);
      if (visited.has(target)) {
        state.truncated = true;
        continue;
      }
      visited.add(target);

      const nestedTexts = await fetchSpfTexts(m.value, queryFn);
      if (nestedTexts.length === 1) {
        const nestedMechanisms = parseSpfMechanisms(nestedTexts[0]);
        await countSpfLookups(nestedMechanisms, queryFn, visited, state);
      }
    }
  }
}

export async function checkSpf(domain: string, queryFn: DnsQueryFn = queryDns): Promise<SpfResult> {
  const records = await fetchSpfTexts(domain, queryFn);
  const multipleRecords = records.length > 1;
  const record = records.length === 1 ? records[0] : null;

  if (!record) {
    return {
      domain,
      found: records.length > 0,
      records,
      record: null,
      multipleRecords,
      mechanisms: [],
      allQualifier: null,
      deprecatedPtrUsed: false,
      lookupCount: 0,
      lookupCountExceeded: false,
      lookupCountTruncated: false,
    };
  }

  const mechanisms = parseSpfMechanisms(record);
  const allMechanism = mechanisms.find((m) => m.mechanism === "all");
  const state: LookupCountState = { count: 0, truncated: false };
  await countSpfLookups(mechanisms, queryFn, new Set([normalizeDomainForVisited(domain)]), state);

  return {
    domain,
    found: true,
    records,
    record,
    multipleRecords,
    mechanisms,
    allQualifier: allMechanism?.qualifier ?? null,
    deprecatedPtrUsed: mechanisms.some((m) => m.mechanism === "ptr"),
    lookupCount: state.count,
    lookupCountExceeded: state.count > SPF_LOOKUP_LIMIT,
    lookupCountTruncated: state.truncated,
  };
}
