import { CACHE_TTL_SECONDS } from "../util/constants";
import { errorResponse, jsonResponse } from "../util/http";
import { safeFetch } from "../ssrf/safeFetch";
import { evaluateHeaders, summarize } from "./evaluate";

const ALLOWED_ORIGINS = new Set(["https://payloadify.com", "https://www.payloadify.com"]);

/** Errors from safeFetch mapped to friendly, non-technical messages — never a raw stack. Kept
 *  distinct per reason (rather than collapsing every validateUrl failure into one generic
 *  "blocked" message) so a transient DNS hiccup doesn't read the same as a genuine SSRF block. */
const FRIENDLY_ERRORS: Record<string, string> = {
  "no-input": "Enter a URL to analyze.",
  "invalid-url": "That doesn't look like a valid URL.",
  "invalid-scheme": "Only http:// and https:// URLs are supported.",
  "blocked-range": "That address isn't allowed.",
  "dns-failure": "Couldn't resolve that domain.",
  "too-many-redirects": "That URL redirected too many times.",
  timeout: "The target took too long to respond.",
  "network-error": "Couldn't reach that address.",
};

function normalizeCacheKeyUrl(request: Request, targetUrl: string): Request {
  const cacheUrl = new URL(request.url);
  cacheUrl.search = `?url=${encodeURIComponent(targetUrl)}`;
  return new Request(cacheUrl.toString(), { method: "GET" });
}

export async function handleSecurityHeaders(request: Request, ctx: ExecutionContext): Promise<Response> {
  // Cheap, non-authoritative complement to the dashboard-configured edge Rate Limiting rule — stops
  // casual cross-site embedding of the API, not a substitute for real rate limiting (a scripted
  // client can trivially forge Origin).
  const origin = request.headers.get("Origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return errorResponse("This API is only callable from payloadify.com.", 403);
  }

  const targetUrl = new URL(request.url).searchParams.get("url");
  if (!targetUrl) {
    return errorResponse("Missing required \"url\" query parameter.");
  }

  const forceFresh = new URL(request.url).searchParams.get("fresh") === "1";
  const cache = caches.default;
  const cacheKey = normalizeCacheKeyUrl(request, targetUrl);

  if (!forceFresh) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const body = await cached.json();
      return jsonResponse({ ...(body as object), cached: true });
    }
  }

  const result = await safeFetch(targetUrl);
  if (!result.ok) {
    return errorResponse(FRIENDLY_ERRORS[result.reason] ?? "Couldn't analyze that address.", 400);
  }

  const headers: Record<string, string> = {};
  result.response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const findings = evaluateHeaders(headers);
  const summary = summarize(findings);

  const responseBody = {
    requestedUrl: targetUrl,
    finalUrl: result.finalUrl,
    redirected: result.redirected,
    summary,
    findings: findings.map((f) => ({
      id: f.rule.id,
      headerName: f.rule.headerName,
      label: f.rule.label,
      polarity: f.rule.polarity,
      explanation: f.rule.explanation,
      owaspUrl: f.rule.owaspUrl,
      mdnUrl: f.rule.mdnUrl,
      informational: f.rule.informational ?? false,
      status: f.result.status,
      detail: f.result.detail,
      recommendation: f.result.recommendation,
    })),
    rawHeaders: headers,
    cached: false,
  };

  const response = jsonResponse(responseBody, {
    headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
