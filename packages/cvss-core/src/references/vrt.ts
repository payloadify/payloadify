export interface VrtCategory {
  id: string;
  /** Full VRT path as published in Bugcrowd's taxonomy, e.g. "Server-Side Injection > SQL Injection". */
  label: string;
  /** Top-level branch of Bugcrowd's taxonomy this leaf sits under, e.g. "Server-Side Injection"
   *  for "Server-Side Injection > SQL Injection" — used to group the dropdown by optgroup. */
  group: string;
  /** Typical priority (P1 highest–P5 lowest). Null when Bugcrowd's own taxonomy leaves this
   *  context-dependent (varies by sub-variant) rather than fixing one rating. */
  priority: "P1" | "P2" | "P3" | "P4" | "P5" | null;
  /** True when no literal VRT leaf exists for this vuln type and the mapping shown is this
   *  tool's own best-practice inference (verified against the current taxonomy, not guessed). */
  inferred?: boolean;
  note?: string;
}

/** Bugcrowd Vulnerability Rating Taxonomy references — verified against the current published
 *  taxonomy at https://bugcrowd.com/vulnerability-rating-taxonomy during authoring. */
export const VRT_CATEGORIES: VrtCategory[] = [
  { id: "xss-reflected", label: "Cross-Site Scripting (XSS) > Reflected > Non-Self", group: "Cross-Site Scripting (XSS)", priority: "P3" },
  {
    id: "xss-stored",
    label: "Cross-Site Scripting (XSS) > Stored > Non-Privileged User to Anyone",
    group: "Cross-Site Scripting (XSS)",
    priority: "P2",
  },
  {
    id: "xss-dom",
    label: "Cross-Site Scripting (XSS): DOM-based",
    group: "Cross-Site Scripting (XSS)",
    priority: null,
    inferred: true,
    note: "No dedicated 'DOM-Based' VRT leaf exists; Bugcrowd scores DOM XSS under Reflected or Stored depending on where the vulnerable sink lives.",
  },
  { id: "sqli-generic", label: "Server-Side Injection > SQL Injection", group: "Server-Side Injection", priority: "P1" },
  {
    id: "idor",
    label: "Broken Access Control (BAC) > Insecure Direct Object References (IDOR)",
    group: "Broken Access Control (BAC)",
    priority: null,
    note: "Priority varies by sub-variant: modify/view sensitive data via iterable IDs is P1-P2, view-only is P3, complex (GUID/UUID) identifiers are P4, non-sensitive info is P5.",
  },
  {
    id: "broken-access-control",
    label: "Broken Access Control (BAC) > Privilege Escalation",
    group: "Broken Access Control (BAC)",
    priority: null,
    note: "Bugcrowd's taxonomy leaves this context-dependent; in practice vertical escalation to admin is typically P1, horizontal escalation P2-P3.",
  },
  {
    id: "ssrf",
    label: "Server Security Misconfiguration > Server-Side Request Forgery (SSRF)",
    group: "Server Security Misconfiguration",
    priority: null,
    note: "Priority varies by what's reached: internal secrets exposure is P2, internal data/port access is P3, presence-only or DNS-only interaction is P4-P5.",
  },
  {
    id: "csrf",
    label: "Cross-Site Request Forgery (CSRF)",
    group: "Cross-Site Request Forgery (CSRF)",
    priority: null,
    note: "Application-wide CSRF on a sensitive action is typically P2; narrower/lower-impact variants (e.g. logout-only) are P5.",
  },
  {
    id: "sensitive-data-exposure",
    label: "Sensitive Data Exposure",
    group: "Sensitive Data Exposure",
    priority: null,
    note: "Priority varies widely by what's exposed: public-facing secret disclosure is P1, hardcoded non-sensitive paths/tokens are P5.",
  },
  {
    id: "open-redirect",
    label: "Unvalidated Redirects and Forwards > Open Redirect",
    group: "Unvalidated Redirects and Forwards",
    priority: "P4",
    note: "P4 for the common GET-based case; header-based/POST-based variants typically rate lower (P5).",
  },
  {
    id: "security-misconfiguration",
    label: "Server Security Misconfiguration",
    group: "Server Security Misconfiguration",
    priority: null,
    note: "Default credentials or an exposed admin portal is typically P1; missing security headers alone is usually P5.",
  },
  {
    id: "insecure-deserialization",
    label: "Server-Side Injection > Remote Code Execution (RCE)",
    group: "Server-Side Injection",
    priority: "P1",
    inferred: true,
    note: "No dedicated 'Insecure Deserialization' leaf exists in Bugcrowd's taxonomy; an exploitable deserialization bug is reported/scored as RCE once weaponized.",
  },
  { id: "xxe", label: "Server-Side Injection > XML External Entity Injection (XXE)", group: "Server-Side Injection", priority: "P1" },
  {
    id: "path-traversal",
    label: "Server-Side Injection > File Inclusion > Local",
    group: "Server-Side Injection",
    priority: "P1",
    note: "Bugcrowd also has a general 'Server Security Misconfiguration > Path Traversal' leaf with context-dependent priority; the Local File Inclusion path is used here as the more precise match.",
  },
  {
    id: "broken-authentication",
    label: "Broken Authentication and Session Management",
    group: "Broken Authentication and Session Management",
    priority: null,
    note: "Full authentication bypass is P1; 2FA bypass is typically P3; session fixation over a remote vector is P3 (local vector P5).",
  },
  {
    id: "command-injection",
    label: "Server-Side Injection > Remote Code Execution (RCE)",
    group: "Server-Side Injection",
    priority: "P1",
    inferred: true,
    note: "Bugcrowd's only literal 'Command Injection' leaf sits under Insecure OS/Firmware (IoT/hardware-scoped); a web/API command injection finding is reported/scored as RCE.",
  },
  {
    id: "parameter-tampering",
    label: "Business Logic Errors > Parameter Tampering (Assumed-Immutable Parameter Manipulation)",
    group: "Business Logic Errors",
    priority: null,
    inferred: true,
    note: "Bugcrowd's current taxonomy has no general-purpose 'Parameter Tampering' leaf — the only literal match is 'Price or Fee Manipulation' (P2) under Decentralized Application Misconfiguration > Marketplace Security, which is scoped to e-commerce/DeFi pricing abuse. Priority is scored by impact: price/quantity/discount tampering is typically P2-P3, while tampering with a privilege/role parameter (e.g. isAdmin=true) is scored under Broken Access Control / Privilege Escalation instead.",
  },
];

export const VRT_CATEGORIES_BY_ID: Record<string, VrtCategory> = Object.fromEntries(VRT_CATEGORIES.map((v) => [v.id, v]));
