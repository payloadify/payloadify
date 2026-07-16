import { queryDns } from "../dns/doh";

export type Resolver = (hostname: string) => Promise<string[]>;

// DNS RR type numbers (RFC 1035 / RFC 3596) — used to filter DoH Answer arrays down to just the
// IP-bearing records for the queried type.
const RR_TYPE_A = 1;
const RR_TYPE_AAAA = 28;

/** Resolves A + AAAA records for `hostname` via DoH. The resolver is injectable so
 *  `validateUrl.test.ts` can supply a fake resolver and stay a pure unit test with no real
 *  network call — `resolveHostname` itself (using the real `queryDns`) is exercised only in
 *  integration testing (wrangler dev), consistent with everything else that touches the network.
 *
 *  A DoH Answer array for a name that's behind a CNAME (extremely common — most CDN-fronted sites,
 *  e.g. anything on Fastly/Akamai/edgekey) includes the CNAME record(s) (type 5) ahead of the final
 *  A/AAAA record(s). Those CNAME answers' `data` is a hostname string, not an IP — passing it
 *  straight into isBlockedIp made it fail-closed (unparseable input is treated as blocked), which
 *  falsely blocked otherwise-public redirect targets like www.wikipedia.org. Filtering by the
 *  queried record's own numeric `type` keeps only the actual IP-bearing answers. */
export const resolveHostname: Resolver = async (hostname) => {
  const [aRecords, aaaaRecords] = await Promise.all([
    queryDns(hostname, "A"),
    queryDns(hostname, "AAAA"),
  ]);
  return [
    ...aRecords.filter((answer) => answer.type === RR_TYPE_A),
    ...aaaaRecords.filter((answer) => answer.type === RR_TYPE_AAAA),
  ].map((answer) => answer.data);
};
