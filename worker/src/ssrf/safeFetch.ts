import { FETCH_TIMEOUT_MS, MAX_REDIRECTS } from "../util/constants";
import { SECURITY_HEADERS_USER_AGENT } from "../util/userAgent";
import { validateUrl, type ValidateUrlResult } from "./validateUrl";

export type SafeFetchResult =
  | { ok: true; response: Response; finalUrl: string; redirected: boolean }
  | {
      ok: false;
      reason: "no-input" | "invalid-url" | "invalid-scheme" | "blocked-range" | "dns-failure" | "too-many-redirects" | "timeout" | "network-error";
    };

/** Fetches `input` with SSRF guards: validates the target (and every redirect hop) against the
 *  blocked-range list before following it, follows redirects manually (never lets `fetch` auto-follow,
 *  which would skip re-validation), caps redirect count, sets an honest identifiable User-Agent, and
 *  applies a short timeout. See `validateUrl.ts` for the accepted residual DNS-rebinding gap. */
export async function safeFetch(input: string): Promise<SafeFetchResult> {
  let currentInput = input;
  let redirected = false;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const validation: ValidateUrlResult = await validateUrl(currentInput);
    if (!validation.ok) {
      return { ok: false, reason: validation.reason };
    }

    let response: Response;
    try {
      response = await fetch(validation.url.toString(), {
        redirect: "manual",
        headers: { "User-Agent": SECURITY_HEADERS_USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        return { ok: false, reason: "timeout" };
      }
      return { ok: false, reason: "network-error" };
    }

    const isRedirect = response.status >= 300 && response.status < 400;
    const location = response.headers.get("Location");
    if (!isRedirect || !location) {
      return { ok: true, response, finalUrl: validation.url.toString(), redirected };
    }

    if (hop === MAX_REDIRECTS) {
      return { ok: false, reason: "too-many-redirects" };
    }

    // Resolve a relative Location header against the current URL before re-validating it.
    currentInput = new URL(location, validation.url).toString();
    redirected = true;
  }

  return { ok: false, reason: "too-many-redirects" };
}
