/** DNS-over-HTTPS client using Cloudflare's own resolver — no auth needed, callable from inside a
 *  Cloudflare Worker like any other outbound fetch. Shared by the Security Headers Analyzer (A/AAAA,
 *  for SSRF resolution) and the future SPF/DKIM/DMARC checker (TXT). */

export type DnsRecordType = "A" | "AAAA" | "TXT";

export interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DohResponseBody {
  Status: number;
  Answer?: DohAnswer[];
}

const DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";

/** Returns the raw Answer records (empty array if none, e.g. NXDOMAIN or no records of that type).
 *  Throws only on a transport-level failure (network error, non-2xx, malformed body) — a clean "no
 *  records found" is not an error. */
export async function queryDns(name: string, type: DnsRecordType): Promise<DohAnswer[]> {
  const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  if (!res.ok) {
    throw new Error(`DoH query failed: ${res.status}`);
  }
  const body = (await res.json()) as DohResponseBody;
  return body.Answer ?? [];
}

/** DoH JSON wraps TXT record content in literal double-quote characters (and escapes internal quotes) —
 *  strip them before parsing SPF/DKIM/DMARC content. Multiple quoted segments (long TXT records split
 *  across 255-byte chunks) are concatenated per RFC 7208 §3.3 / RFC 6376 §3.5. */
export function stripDnsTxtQuotes(data: string): string {
  const matches = data.match(/"((?:[^"\\]|\\.)*)"/g);
  if (!matches) return data;
  return matches.map((segment) => segment.slice(1, -1).replace(/\\"/g, '"')).join("");
}
