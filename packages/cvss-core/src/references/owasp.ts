export type OwaspWebVersion = "2021" | "2025";

/** Dropdown/optgroup grouping: the Web catalogue splits into two editions users can pick
 *  between (see OwaspWebVersion); API and Mobile each still have exactly one current edition. */
export type OwaspGroup = "web-2021" | "web-2025" | "api" | "mobile";

export interface OwaspCategory {
  id: string;
  label: string;
  url: string;
}

export const OWASP_GROUP_LABELS: Record<OwaspGroup, string> = {
  "web-2021": "OWASP Top 10 (2021): Web",
  "web-2025": "OWASP Top 10 (2025): Web",
  api: "OWASP API Security Top 10 (2023)",
  mobile: "OWASP Mobile Top 10 (2024)",
};

export const OWASP_GROUP_ORDER: OwaspGroup[] = ["web-2021", "web-2025", "api", "mobile"];

/** Every id is authored with a "web-"/"web25-"/"api-"/"mobile-" prefix (see OWASP_CATEGORIES
 *  below) — reusing that instead of a separate per-entry field keeps the two from drifting apart. */
export function owaspGroupOf(id: string): OwaspGroup {
  if (id.startsWith("api-")) return "api";
  if (id.startsWith("mobile-")) return "mobile";
  if (id.startsWith("web25-")) return "web-2025";
  return "web-2021";
}

/**
 * The full OWASP Top 10 (2021), API Security Top 10 (2023), and Mobile Top 10 (2024) catalogues
 * — all 10 entries in each of the three lists, not just the subset templates.ts/chaining.ts
 * happen to reference today. Every entry (including the 13 added in the completeness pass) was
 * verified directly against owasp.org during authoring — see the research notes below for
 * cross-cutting caveats. Keeping the full catalogue here (rather than only "used" categories)
 * means a future template can pick up e.g. A06/A09/API4/API9/M1/M7 without a second research pass.
 *
 * - XSS, SQL Injection, and OS Command Injection all collapsed into the single "A03:2021 –
 *   Injection" category in the 2021 revision (previously separate/more granular).
 * - CSRF and Path Traversal have no standalone OWASP Top 10 category at all — both are just
 *   CWEs bucketed under A01:2021 on OWASP's own mapped-CWE list, not distinct entries.
 * - Platform drives which family is shown: a template's owaspRefId should point at the most
 *   specific catalogue that actually covers its platform — Web Top 10 for web findings, API
 *   Security Top 10 for API findings, Mobile Top 10 for findings that are genuinely mobile-app-
 *   specific (client-side storage, WebView/binary issues, on-device auth). A vulnerability found
 *   via a mobile app but that actually lives in its backend API (e.g. missing rate-limiting on
 *   the login endpoint) should still cite the API category, not a Mobile one — the platform the
 *   bug was *found on* isn't always the platform the fix belongs to.
 * - Where a vuln type has a confirmed *exact* API Top 10 2023 analogue (BOLA, Broken
 *   Authentication, BOPLA, Broken Function Level Authorization, SSRF, Security
 *   Misconfiguration), that more specific category is used instead of the general web one.
 *   Some families (SQLi, XSS, OS command injection, XXE, insecure deserialization, path
 *   traversal, open redirect) have no API-specific analogue at all — the 2023 API Top 10
 *   dropped its 2019 "Injection" category on the assumption the main OWASP Top 10 already
 *   covers it — so those keep the Web category even when the platform is "api".
 * - API10:2023's own URL slug is irregular — "0xaa-unsafe-consumption-of-apis", not the
 *   "0xa10-..." pattern the other nine entries follow. Verified live; not a typo.
 * - Mobile M7's official page title is singular — "Insufficient Binary Protection" — even
 *   though it's commonly written "Protections" elsewhere; the label here matches the page title.
 */
export const OWASP_CATEGORIES: OwaspCategory[] = [
  { id: "web-a01-broken-access-control", label: "A01:2021 - Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
  { id: "web-a02-crypto-failures", label: "A02:2021 - Cryptographic Failures", url: "https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/" },
  { id: "web-a03-injection", label: "A03:2021 - Injection", url: "https://owasp.org/Top10/2021/A03_2021-Injection/" },
  { id: "web-a04-insecure-design", label: "A04:2021 - Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
  {
    id: "web-a05-security-misconfiguration",
    label: "A05:2021 - Security Misconfiguration",
    url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/",
  },
  {
    id: "web-a06-vulnerable-outdated-components",
    label: "A06:2021 - Vulnerable and Outdated Components",
    url: "https://owasp.org/Top10/2021/A06_2021-Vulnerable_and_Outdated_Components/",
  },
  {
    id: "web-a07-auth-failures",
    label: "A07:2021 - Identification and Authentication Failures",
    url: "https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/",
  },
  {
    id: "web-a08-software-data-integrity",
    label: "A08:2021 - Software and Data Integrity Failures",
    url: "https://owasp.org/Top10/2021/A08_2021-Software_and_Data_Integrity_Failures/",
  },
  {
    id: "web-a09-logging-monitoring-failures",
    label: "A09:2021 - Security Logging and Monitoring Failures",
    url: "https://owasp.org/Top10/2021/A09_2021-Security_Logging_and_Monitoring_Failures/",
  },
  {
    id: "web-a10-ssrf",
    label: "A10:2021 - Server-Side Request Forgery (SSRF)",
    url: "https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/",
  },
  {
    id: "api-api1-bola",
    label: "API1:2023 - Broken Object Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/",
  },
  {
    id: "api-api2-broken-authentication",
    label: "API2:2023 - Broken Authentication",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/",
  },
  {
    id: "api-api3-bopla",
    label: "API3:2023 - Broken Object Property Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/",
  },
  {
    id: "api-api4-unrestricted-resource-consumption",
    label: "API4:2023 - Unrestricted Resource Consumption",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/",
  },
  {
    id: "api-api5-bfla",
    label: "API5:2023 - Broken Function Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/",
  },
  {
    id: "api-api6-unrestricted-business-flows",
    label: "API6:2023 - Unrestricted Access to Sensitive Business Flows",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/",
  },
  {
    id: "api-api7-ssrf",
    label: "API7:2023 - Server Side Request Forgery",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa7-server-side-request-forgery/",
  },
  {
    id: "api-api8-security-misconfiguration",
    label: "API8:2023 - Security Misconfiguration",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/",
  },
  {
    id: "api-api9-improper-inventory-management",
    label: "API9:2023 - Improper Inventory Management",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa9-improper-inventory-management/",
  },
  {
    id: "api-api10-unsafe-consumption",
    label: "API10:2023 - Unsafe Consumption of APIs",
    url: "https://owasp.org/API-Security/editions/2023/en/0xaa-unsafe-consumption-of-apis/",
  },
  {
    id: "mobile-m1-improper-credential-usage",
    label: "M1:2024 - Improper Credential Usage",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m1-improper-credential-usage.html",
  },
  {
    id: "mobile-m2-inadequate-supply-chain-security",
    label: "M2:2024 - Inadequate Supply Chain Security",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m2-inadequate-supply-chain-security.html",
  },
  {
    id: "mobile-m3-insecure-auth",
    label: "M3:2024 - Insecure Authentication/Authorization",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m3-insecure-authentication-authorization.html",
  },
  {
    id: "mobile-m4-input-output-validation",
    label: "M4:2024 - Insufficient Input/Output Validation",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m4-insufficient-input-output-validation.html",
  },
  {
    id: "mobile-m5-insecure-communication",
    label: "M5:2024 - Insecure Communication",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m5-insecure-communication.html",
  },
  {
    id: "mobile-m6-inadequate-privacy-controls",
    label: "M6:2024 - Inadequate Privacy Controls",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m6-inadequate-privacy-controls.html",
  },
  {
    id: "mobile-m7-insufficient-binary-protection",
    label: "M7:2024 - Insufficient Binary Protection",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m7-insufficient-binary-protection.html",
  },
  {
    id: "mobile-m8-security-misconfiguration",
    label: "M8:2024 - Security Misconfiguration",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m8-security-misconfiguration.html",
  },
  {
    id: "mobile-m9-insecure-data-storage",
    label: "M9:2024 - Insecure Data Storage",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m9-insecure-data-storage.html",
  },
  {
    id: "mobile-m10-insufficient-cryptography",
    label: "M10:2024 - Insufficient Cryptography",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m10-insufficient-cryptography.html",
  },

  // ---- OWASP Top 10:2025 — Web (all 10 pages verified live against owasp.org during authoring;
  // API Security Top 10 and Mobile Top 10 have not been revised for 2025, so those two
  // catalogues above are unaffected by this section) ----
  { id: "web25-a01-broken-access-control", label: "A01:2025 - Broken Access Control", url: "https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/" },
  {
    id: "web25-a02-security-misconfiguration",
    label: "A02:2025 - Security Misconfiguration",
    url: "https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/",
  },
  {
    id: "web25-a03-software-supply-chain-failures",
    label: "A03:2025 - Software Supply Chain Failures",
    url: "https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/",
  },
  {
    id: "web25-a04-cryptographic-failures",
    label: "A04:2025 - Cryptographic Failures",
    url: "https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/",
  },
  { id: "web25-a05-injection", label: "A05:2025 - Injection", url: "https://owasp.org/Top10/2025/A05_2025-Injection/" },
  { id: "web25-a06-insecure-design", label: "A06:2025 - Insecure Design", url: "https://owasp.org/Top10/2025/A06_2025-Insecure_Design/" },
  {
    id: "web25-a07-authentication-failures",
    label: "A07:2025 - Authentication Failures",
    url: "https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/",
  },
  {
    id: "web25-a08-software-or-data-integrity-failures",
    label: "A08:2025 - Software or Data Integrity Failures",
    url: "https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/",
  },
  {
    id: "web25-a09-security-logging-alerting-failures",
    label: "A09:2025 - Security Logging and Alerting Failures",
    url: "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/",
  },
  {
    id: "web25-a10-mishandling-exceptional-conditions",
    label: "A10:2025 - Mishandling of Exceptional Conditions",
    url: "https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/",
  },
];

export const OWASP_CATEGORIES_BY_ID: Record<string, OwaspCategory> = Object.fromEntries(OWASP_CATEGORIES.map((c) => [c.id, c]));

/**
 * CWE → OWASP Top 10:2025 Web category, for auto-translating a template/chain's authored
 * 2021 owaspRefId into its 2025 equivalent when the user has the "2025" Web edition selected
 * (see CvssCalculatorTool's owaspWebVersion state). Keyed by CWE rather than by the old
 * 2021 category id — a straight "2021 category N -> 2025 category M" renumbering table would
 * be *wrong* for several CWEs that OWASP moved to a different category than their old peers
 * when the taxonomy was reshuffled, per each 2025 category's own published CWE list:
 *
 * - CWE-200 (sensitive data exposed in a URL) sat under A02:2021 Cryptographic Failures, but
 *   2025's Cryptographic Failures list does NOT include it — OWASP moved it to A01:2025
 *   Broken Access Control instead (that page's own background text calls out CWE-200 by name).
 * - CWE-1392 (default credentials) and CWE-209 (verbose error messages) both sat under
 *   A05:2021 Security Misconfiguration; 2025's Security Misconfiguration list contains
 *   neither. CWE-1392 moved to A07:2025 Authentication Failures; CWE-209 moved to the new
 *   A10:2025 Mishandling of Exceptional Conditions.
 * - CWE-918 (SSRF) sat alone under A10:2021; that category no longer exists in 2025 — SSRF
 *   was folded into A01:2025 Broken Access Control (confirmed via that page's background text).
 *
 * Every other CWE below the same 2021 category are a straight rename/renumber (verified by
 * checking each CWE's presence in the corresponding 2025 category's own published CWE list,
 * not assumed from the rank shift). This table only needs an entry for CWEs that are actually
 * used with a "web-"-family owaspRefId in templates.ts/chaining.ts today — owasp.test.ts and
 * templates.test.ts assert every such CWE has one, so a future template introducing a new CWE
 * will fail loudly here instead of silently mis-mapping.
 */
export const OWASP_WEB_2025_CWE_MAP: Record<string, string> = {
  "CWE-79": "web25-a05-injection",
  "CWE-89": "web25-a05-injection",
  "CWE-78": "web25-a05-injection",
  "CWE-639": "web25-a01-broken-access-control",
  "CWE-284": "web25-a01-broken-access-control",
  "CWE-918": "web25-a01-broken-access-control",
  "CWE-352": "web25-a01-broken-access-control",
  "CWE-601": "web25-a01-broken-access-control",
  "CWE-22": "web25-a01-broken-access-control",
  "CWE-200": "web25-a01-broken-access-control",
  "CWE-862": "web25-a01-broken-access-control",
  "CWE-489": "web25-a02-security-misconfiguration",
  "CWE-611": "web25-a02-security-misconfiguration",
  "CWE-1392": "web25-a07-authentication-failures",
  "CWE-640": "web25-a07-authentication-failures",
  "CWE-384": "web25-a07-authentication-failures",
  "CWE-307": "web25-a07-authentication-failures",
  "CWE-209": "web25-a10-mishandling-exceptional-conditions",
  "CWE-502": "web25-a08-software-or-data-integrity-failures",
  "CWE-472": "web25-a06-insecure-design",
};

/** The 2021 counterpart of OWASP_WEB_2025_CWE_MAP — every CWE above's *original* 2021 Web
 *  category, as authored in templates.ts/chaining.ts today. Lets a category already resolved
 *  to 2025 be translated back to 2021 (e.g. the user flips the edition toggle back) without
 *  having to re-apply a template — same CWE-driven approach, same reason a plain id-to-id
 *  table would be wrong (multiple 2021 categories collapse onto one 2025 category: both
 *  A05:2021 and A10:2021 CWEs can map to a single 2025 target, so going forward-then-back
 *  through *category ids* would lose information; going through the CWE instead does not). */
export const OWASP_WEB_2021_CWE_MAP: Record<string, string> = {
  "CWE-79": "web-a03-injection",
  "CWE-89": "web-a03-injection",
  "CWE-78": "web-a03-injection",
  "CWE-639": "web-a01-broken-access-control",
  "CWE-284": "web-a01-broken-access-control",
  "CWE-918": "web-a10-ssrf",
  "CWE-352": "web-a01-broken-access-control",
  "CWE-601": "web-a01-broken-access-control",
  "CWE-22": "web-a01-broken-access-control",
  "CWE-862": "web-a01-broken-access-control",
  "CWE-200": "web-a02-crypto-failures",
  "CWE-489": "web-a05-security-misconfiguration",
  "CWE-611": "web-a05-security-misconfiguration",
  "CWE-1392": "web-a05-security-misconfiguration",
  "CWE-640": "web-a07-auth-failures",
  "CWE-384": "web-a07-auth-failures",
  "CWE-307": "web-a07-auth-failures",
  "CWE-209": "web-a05-security-misconfiguration",
  "CWE-502": "web-a08-software-data-integrity",
  "CWE-472": "web-a04-insecure-design",
};

/** Resolves a Web owaspRefId + its finding's cweId to the requested Web edition. Returns the
 *  original id unchanged for non-Web (api-/mobile-) ids, or if the CWE has no verified mapping
 *  for the target edition (see OWASP_WEB_2025_CWE_MAP / OWASP_WEB_2021_CWE_MAP). Used both when
 *  a template/chain/saved template is applied and when the user flips the edition toggle on an
 *  already-selected category — the latter matters because a category picked while on one
 *  edition would otherwise silently stay on that edition after switching, looking like the
 *  toggle "does nothing". */
export function toOwaspWebVersion(owaspRefId: string, cweId: string, targetVersion: OwaspWebVersion): string {
  const group = owaspGroupOf(owaspRefId);
  if (group === "api" || group === "mobile") return owaspRefId;
  const map = targetVersion === "2025" ? OWASP_WEB_2025_CWE_MAP : OWASP_WEB_2021_CWE_MAP;
  return map[cweId] ?? owaspRefId;
}
