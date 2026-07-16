/** Accepts a bare domain or a pasted URL (scheme, path, query, port, trailing dot) and reduces it
 *  to a bare lowercase domain suitable for a DNS TXT lookup. Not shared with
 *  worker/src/ssrf/validateUrl.ts — that module validates a fetchable URL (scheme + resolvable IP
 *  for SSRF purposes); this one just extracts a hostname, no SSRF concerns since this tool never
 *  fetches arbitrary URLs, only queries public DNS TXT records. */

export type NormalizeDomainResult = { ok: true; domain: string } | { ok: false; reason: "empty" | "invalid" };

const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeDomain(input: string): NormalizeDomainResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "empty" };

  let candidate = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  candidate = candidate.split(/[/?#]/)[0];
  candidate = candidate.split(":")[0];
  candidate = candidate.replace(/\.$/, "");
  candidate = candidate.toLowerCase();

  if (!DOMAIN_RE.test(candidate)) return { ok: false, reason: "invalid" };
  return { ok: true, domain: candidate };
}
