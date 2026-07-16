import { CACHE_TTL_SECONDS } from "../util/constants";
import { errorResponse, jsonResponse } from "../util/http";
import { COMMON_DKIM_SELECTORS } from "./commonSelectors";
import { checkDkim } from "./dkim";
import { checkDmarc } from "./dmarc";
import { normalizeDomain } from "./normalizeDomain";
import { checkSpf } from "./spf";

// Duplicated from securityHeaders/handler.ts rather than factored into a shared module — a small,
// literal 5-line check isn't worth reaching across the two feature folders for, and keeps each
// handler independently readable (matches the project's existing per-tool-copy-settings precedent).
const ALLOWED_ORIGINS = new Set(["https://payloadify.com", "https://www.payloadify.com"]);

const FRIENDLY_ERRORS: Record<string, string> = {
  empty: "Enter a domain to check.",
  invalid: "That doesn't look like a valid domain.",
};

function normalizeCacheKeyUrl(request: Request, domain: string, selectors: string[]): Request {
  const cacheUrl = new URL(request.url);
  cacheUrl.search = `?domain=${encodeURIComponent(domain)}&selectors=${encodeURIComponent(selectors.join(","))}`;
  return new Request(cacheUrl.toString(), { method: "GET" });
}

export async function handleEmailAuth(request: Request, ctx: ExecutionContext): Promise<Response> {
  const origin = request.headers.get("Origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return errorResponse("This API is only callable from payloadify.com.", 403);
  }

  const url = new URL(request.url);
  const rawDomain = url.searchParams.get("domain");
  if (!rawDomain) {
    return errorResponse("Missing required \"domain\" query parameter.");
  }

  const normalized = normalizeDomain(rawDomain);
  if (!normalized.ok) {
    return errorResponse(FRIENDLY_ERRORS[normalized.reason]);
  }
  const { domain } = normalized;

  const userSelector = url.searchParams.get("selector");
  const userSelectors = userSelector
    ? userSelector.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];
  const selectors = [...new Set([...userSelectors, ...COMMON_DKIM_SELECTORS])];

  const forceFresh = url.searchParams.get("fresh") === "1";
  const cache = caches.default;
  const cacheKey = normalizeCacheKeyUrl(request, domain, selectors);

  if (!forceFresh) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const body = await cached.json();
      return jsonResponse({ ...(body as object), cached: true });
    }
  }

  const [spf, dmarc, dkim] = await Promise.all([checkSpf(domain), checkDmarc(domain), checkDkim(domain, selectors)]);

  const responseBody = {
    domain,
    spf,
    dmarc,
    dkim,
    dkimSelectorsChecked: selectors.length,
    cached: false,
  };

  const response = jsonResponse(responseBody, {
    headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
