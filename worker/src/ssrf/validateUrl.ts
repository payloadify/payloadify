import { isBlockedIp } from "./blockedRanges";
import { resolveHostname, type Resolver } from "./resolve";

export type ValidateUrlResult =
  | { ok: true; url: URL; ip: string }
  | { ok: false; reason: "no-input" | "invalid-url" | "invalid-scheme" | "blocked-range" | "dns-failure" };

/** Strips brackets from an IPv6 literal host as it appears in a URL, e.g. "[::1]" -> "::1". */
function unwrapIpv6Host(host: string): string {
  return host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
}

/** True if `host` (already unwrapped of brackets) parses as a literal IP address — used to skip DNS
 *  resolution for direct-IP input. Delegates the actual parse to `isBlockedIp`'s own parsers by
 *  reusing `resolveHostname`'s contract: a hostname that IS an IP has no DNS to resolve, so treat it
 *  as its own single "resolved" address. */
function looksLikeIpLiteral(host: string): boolean {
  return /^[0-9.]+$/.test(host) || /^[0-9a-fA-F:]+$/.test(host);
}

/** Validates a user-supplied URL for the Security Headers Analyzer's outbound fetch: scheme,
 *  then resolves the hostname and rejects if ANY returned IP is in a blocked range (never just
 *  string-matching the hostname). Does not itself defend against DNS rebinding between this
 *  validation and the eventual fetch — see `safeFetch.ts` and the SSRF disclosure in SECURITY.md
 *  for why that residual gap exists and why it's an accepted, disclosed platform limitation. */
export async function validateUrl(input: string, resolve: Resolver = resolveHostname): Promise<ValidateUrlResult> {
  if (!input || !input.trim()) return { ok: false, reason: "no-input" };

  let url: URL;
  try {
    // Default to https if the user omitted a scheme entirely.
    url = new URL(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input) ? input : `https://${input}`);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "invalid-scheme" };
  }

  const host = unwrapIpv6Host(url.hostname);

  if (looksLikeIpLiteral(host)) {
    return isBlockedIp(host) ? { ok: false, reason: "blocked-range" } : { ok: true, url, ip: host };
  }

  let ips: string[];
  try {
    ips = await resolve(host);
  } catch {
    return { ok: false, reason: "dns-failure" };
  }
  if (ips.length === 0) return { ok: false, reason: "dns-failure" };

  const blocked = ips.find((ip) => isBlockedIp(ip));
  if (blocked) return { ok: false, reason: "blocked-range" };

  return { ok: true, url, ip: ips[0] };
}
