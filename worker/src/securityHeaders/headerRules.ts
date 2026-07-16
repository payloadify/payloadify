/** One entry per header this tool checks, referencing the OWASP Secure Headers Project and MDN.
 *  `polarity` distinguishes headers whose PRESENCE is good (the security headers) from headers
 *  whose presence is a mild information-disclosure risk (Server, X-Powered-By, etc) — both use the
 *  same 3-state pass/warn/missing shape so the frontend doesn't need two parallel types. */

export type HeaderStatus = "pass" | "warn" | "missing";

export interface HeaderEvaluation {
  status: HeaderStatus;
  detail: string;
  recommendation?: string;
}

export interface HeaderRule {
  id: string;
  headerName: string;
  label: string;
  polarity: "present-good" | "present-bad";
  explanation: string;
  owaspUrl: string;
  mdnUrl: string;
  /** Extra hardening the spec calls out as informational rather than a hard requirement (COOP,
   *  COEP, CORP) — the frontend renders "Missing · Optional" instead of a bare "Missing" for
   *  these, so a missing informational header doesn't read the same as a missing HSTS/CSP. */
  informational?: boolean;
  evaluate: (value: string | null, allHeaders: Record<string, string>) => HeaderEvaluation;
}

function lower(name: string): string {
  return name.toLowerCase();
}

/** Case-insensitive header lookup — the Fetch API's Headers object already lowercases keys when
 *  iterated, but callers may pass in a plain object built another way. */
function get(headers: Record<string, string>, name: string): string | null {
  return headers[lower(name)] ?? null;
}

export const HEADER_RULES: HeaderRule[] = [
  {
    id: "hsts",
    headerName: "Strict-Transport-Security",
    label: "Strict-Transport-Security (HSTS)",
    polarity: "present-good",
    explanation:
      "Tells browsers to only ever connect to this site over HTTPS, even if a user types or follows an http:// link — closes the window for SSL-stripping downgrade attacks.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#http-strict-transport-security",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
    evaluate: (value) => {
      if (!value) {
        return {
          status: "missing",
          detail: "Not set.",
          recommendation: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
        };
      }
      const maxAgeMatch = value.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 0;
      if (!maxAgeMatch || maxAge === 0) {
        return { status: "warn", detail: `Present but max-age is missing or 0: "${value}".`, recommendation: "Set max-age to at least 31536000 (1 year)." };
      }
      if (maxAge < 15552000) {
        return { status: "warn", detail: `Present with a short max-age (${maxAge}s): "${value}".`, recommendation: "Increase max-age to at least 15552000 (180 days), ideally 63072000 (2 years)." };
      }
      const notes: string[] = [];
      if (!/includesubdomains/i.test(value)) notes.push("consider adding includeSubDomains");
      if (!/preload/i.test(value)) notes.push("consider adding preload (and submitting to hstspreload.org)");
      return {
        status: notes.length ? "warn" : "pass",
        detail: `Present: "${value}".`,
        recommendation: notes.length ? notes.join("; ") : undefined,
      };
    },
  },
  {
    id: "csp",
    headerName: "Content-Security-Policy",
    label: "Content-Security-Policy (CSP)",
    polarity: "present-good",
    explanation:
      "Restricts which sources scripts, styles, and other resources may load from, meaningfully reducing the impact of XSS. This check is informational, not a full CSP audit — it flags obviously weak directives, not every possible bypass.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#content-security-policy",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy",
    evaluate: (value) => {
      if (!value) {
        return { status: "missing", detail: "Not set.", recommendation: "Content-Security-Policy: default-src 'self'" };
      }
      const weak: string[] = [];
      if (/unsafe-inline/i.test(value)) weak.push("'unsafe-inline'");
      if (/unsafe-eval/i.test(value)) weak.push("'unsafe-eval'");
      if (/(^|[\s;])\*(?=[\s;]|$)/.test(value)) weak.push("a wildcard (*) source");
      return {
        status: weak.length ? "warn" : "pass",
        detail: `Present: "${value}".`,
        recommendation: weak.length ? `Contains ${weak.join(", ")} — consider tightening (this is informational, not a full CSP audit).` : undefined,
      };
    },
  },
  {
    id: "x-frame-options",
    headerName: "X-Frame-Options",
    label: "X-Frame-Options / frame-ancestors",
    polarity: "present-good",
    explanation: "Prevents the page from being embedded in an <iframe> on another site — the classic clickjacking defense.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#x-frame-options",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
    evaluate: (value, allHeaders) => {
      const csp = get(allHeaders, "content-security-policy");
      const hasFrameAncestors = csp ? /frame-ancestors/i.test(csp) : false;
      if (value && /^(deny|sameorigin)$/i.test(value.trim())) {
        return { status: "pass", detail: `Present: "${value}".` };
      }
      if (hasFrameAncestors) {
        return { status: "pass", detail: "X-Frame-Options not set, but CSP's frame-ancestors directive covers clickjacking protection." };
      }
      if (value) {
        return { status: "warn", detail: `Present with an unrecognized value: "${value}".`, recommendation: "Use DENY or SAMEORIGIN, or rely on CSP frame-ancestors." };
      }
      return { status: "missing", detail: "Not set, and no CSP frame-ancestors directive present.", recommendation: "X-Frame-Options: DENY (or CSP frame-ancestors 'none')" };
    },
  },
  {
    id: "x-content-type-options",
    headerName: "X-Content-Type-Options",
    label: "X-Content-Type-Options",
    polarity: "present-good",
    explanation: "Stops browsers from MIME-sniffing a response into a different content type than declared, closing off some content-sniffing-based attacks.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#x-content-type-options",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
    evaluate: (value) => {
      if (value && value.trim().toLowerCase() === "nosniff") return { status: "pass", detail: `Present: "${value}".` };
      if (value) return { status: "warn", detail: `Present with an unexpected value: "${value}".`, recommendation: "X-Content-Type-Options: nosniff" };
      return { status: "missing", detail: "Not set.", recommendation: "X-Content-Type-Options: nosniff" };
    },
  },
  {
    id: "referrer-policy",
    headerName: "Referrer-Policy",
    label: "Referrer-Policy",
    polarity: "present-good",
    explanation: "Controls how much of this page's URL is sent as the Referer header when a user follows a link away from it — limits leaking sensitive path/query data to third parties.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#referrer-policy",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
    evaluate: (value) => {
      if (!value) return { status: "missing", detail: "Not set.", recommendation: "Referrer-Policy: strict-origin-when-cross-origin" };
      const weakValues = ["unsafe-url"];
      if (weakValues.includes(value.trim().toLowerCase())) {
        return { status: "warn", detail: `Present with a permissive value: "${value}".`, recommendation: "Consider strict-origin-when-cross-origin or no-referrer." };
      }
      return { status: "pass", detail: `Present: "${value}".` };
    },
  },
  {
    id: "permissions-policy",
    headerName: "Permissions-Policy",
    label: "Permissions-Policy",
    polarity: "present-good",
    explanation: "Lets a site explicitly disable or restrict powerful browser features (camera, microphone, geolocation, etc) for itself and any embedded content.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#permissions-policy",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy",
    evaluate: (value) => (value ? { status: "pass", detail: `Present: "${value}".` } : { status: "missing", detail: "Not set.", recommendation: "Permissions-Policy: geolocation=(), camera=(), microphone=()" }),
  },
  {
    id: "coop",
    headerName: "Cross-Origin-Opener-Policy",
    label: "Cross-Origin-Opener-Policy (COOP)",
    polarity: "present-good",
    explanation: "Isolates this page's browsing context from cross-origin popups/openers — informational hardening, not a hard requirement for most sites.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#cross-origin-opener-policy",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy",
    informational: true,
    evaluate: (value) => (value ? { status: "pass", detail: `Present: "${value}".` } : { status: "missing", detail: "Not set." }),
  },
  {
    id: "coep",
    headerName: "Cross-Origin-Embedder-Policy",
    label: "Cross-Origin-Embedder-Policy (COEP)",
    polarity: "present-good",
    explanation: "Requires cross-origin resources to explicitly opt in before this page can load them — informational hardening, mainly relevant if using SharedArrayBuffer/cross-origin isolation features.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#cross-origin-embedder-policy",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy",
    informational: true,
    evaluate: (value) => (value ? { status: "pass", detail: `Present: "${value}".` } : { status: "missing", detail: "Not set." }),
  },
  {
    id: "corp",
    headerName: "Cross-Origin-Resource-Policy",
    label: "Cross-Origin-Resource-Policy (CORP)",
    polarity: "present-good",
    explanation: "Lets a resource declare whether it may be loaded cross-origin — informational hardening against some speculative side-channel attacks (e.g. Spectre-style).",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#cross-origin-resource-policy",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy",
    informational: true,
    evaluate: (value) => (value ? { status: "pass", detail: `Present: "${value}".` } : { status: "missing", detail: "Not set." }),
  },
  {
    id: "server",
    headerName: "Server",
    label: "Server (information disclosure)",
    polarity: "present-bad",
    explanation: "Exposing detailed server software/version information makes it easier for an attacker to target known vulnerabilities for that exact version.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#server",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server",
    evaluate: (value) => {
      if (!value) return { status: "pass", detail: "Not set — no server software disclosed." };
      return {
        status: "warn",
        detail: `Present: "${value}".`,
        recommendation: "Suppress or genericize this header at the server/proxy level.",
      };
    },
  },
  {
    id: "x-powered-by",
    headerName: "X-Powered-By",
    label: "X-Powered-By (information disclosure)",
    polarity: "present-bad",
    explanation: "Discloses the application framework/runtime (e.g. PHP, Express) in use, narrowing an attacker's guesswork.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#x-powered-by",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Powered-By",
    evaluate: (value) => (value ? { status: "warn", detail: `Present: "${value}".`, recommendation: "Disable this header at the framework/server level." } : { status: "pass", detail: "Not set." }),
  },
  {
    id: "x-aspnet-version",
    headerName: "X-AspNet-Version",
    label: "X-AspNet-Version (information disclosure)",
    polarity: "present-bad",
    explanation: "Discloses the exact ASP.NET version in use, making it easier to target known vulnerabilities for that version.",
    owaspUrl: "https://owasp.org/www-project-secure-headers/#x-aspnet-version",
    mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-AspNet-Version",
    evaluate: (value) => (value ? { status: "warn", detail: `Present: "${value}".`, recommendation: "Disable this header (httpRuntime enableVersionHeader=\"false\")." } : { status: "pass", detail: "Not set." }),
  },
];
