export type CweCategory =
  | "injection"
  | "access-control"
  | "auth-session"
  | "crypto"
  | "info-disclosure"
  | "input-validation"
  | "insecure-design-config"
  | "file-resource"
  | "memory-safety"
  | "race-condition"
  | "client-side";

export const CWE_CATEGORY_LABELS: Record<CweCategory, string> = {
  injection: "Injection",
  "access-control": "Access Control & Authorization",
  "auth-session": "Authentication & Session Management",
  crypto: "Cryptographic Issues",
  "info-disclosure": "Information Disclosure",
  "input-validation": "Input Validation",
  "insecure-design-config": "Insecure Design & Configuration",
  "file-resource": "File & Resource Handling",
  "memory-safety": "Memory Safety",
  "race-condition": "Race Conditions",
  "client-side": "Client-Side & Request Forgery",
};

/** Alphabetical by CWE_CATEGORY_LABELS (not by key), so the dropdown's optgroups read A-Z. */
export const CWE_CATEGORY_ORDER: CweCategory[] = [
  "access-control",
  "auth-session",
  "client-side",
  "crypto",
  "file-resource",
  "info-disclosure",
  "injection",
  "input-validation",
  "insecure-design-config",
  "memory-safety",
  "race-condition",
];

export interface CweEntry {
  id: string;
  label: string;
  url: string;
  category: CweCategory;
  /** True for broad Class/Pillar-level CWEs that MITRE itself discourages mapping findings to
   *  directly (they're too abstract to point at a specific fix) but that people commonly pick
   *  anyway when they're not sure which specific child weakness applies. Still fully selectable
   *  here, one per category is surfaced first with a "(broad ...)" suffix in the UI so it reads
   *  as a fallback, not the recommended choice. */
  isParent?: boolean;
}

/** CWE entries for the CVSS Calculator's CWE dropdown, grouped into 11 editorial
 *  vulnerability-class categories (CWE_CATEGORY_ORDER) for browsability. This grouping is our
 *  own organization for the dropdown, not MITRE's own Research-Concepts/pillar view — the
 *  `isParent` flag is the only claim here about a CWE's actual MITRE abstraction level
 *  (Pillar/Class vs Base/Variant), used to flag broad catch-all CWEs (e.g. CWE-20, CWE-284)
 *  as discouraged-but-selectable, same as their real-world use in bug reports.
 *
 *  Every id/label/url below (including the 23 entries carried over from the original list) was
 *  verified directly against cwe.mitre.org during authoring. `templates.ts`/`chaining.ts`/
 *  `vrtAutofill.ts` only ever reference the 23 pre-existing ids; the rest are additive, for
 *  manual selection. */
export const CWE_ENTRIES: CweEntry[] = [
  // ---- Injection (parent: CWE-74) ----
  {
    id: "CWE-74",
    label: "Improper Neutralization of Special Elements in Output Used by a Downstream Component ('Injection')",
    url: "https://cwe.mitre.org/data/definitions/74.html",
    category: "injection",
    isParent: true,
  },
  { id: "CWE-78", label: "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')", url: "https://cwe.mitre.org/data/definitions/78.html", category: "injection" },
  { id: "CWE-79", label: "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')", url: "https://cwe.mitre.org/data/definitions/79.html", category: "injection" },
  { id: "CWE-89", label: "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')", url: "https://cwe.mitre.org/data/definitions/89.html", category: "injection" },
  { id: "CWE-90", label: "Improper Neutralization of Special Elements used in an LDAP Query ('LDAP Injection')", url: "https://cwe.mitre.org/data/definitions/90.html", category: "injection" },
  { id: "CWE-91", label: "XML Injection (aka Blind XPath Injection)", url: "https://cwe.mitre.org/data/definitions/91.html", category: "injection" },
  { id: "CWE-93", label: "Improper Neutralization of CRLF Sequences ('CRLF Injection')", url: "https://cwe.mitre.org/data/definitions/93.html", category: "injection" },
  { id: "CWE-94", label: "Improper Control of Generation of Code ('Code Injection')", url: "https://cwe.mitre.org/data/definitions/94.html", category: "injection" },
  { id: "CWE-95", label: "Improper Neutralization of Directives in Dynamically Evaluated Code ('Eval Injection')", url: "https://cwe.mitre.org/data/definitions/95.html", category: "injection" },
  { id: "CWE-611", label: "Improper Restriction of XML External Entity Reference", url: "https://cwe.mitre.org/data/definitions/611.html", category: "injection" },
  { id: "CWE-643", label: "Improper Neutralization of Data within XPath Expressions ('XPath Injection')", url: "https://cwe.mitre.org/data/definitions/643.html", category: "injection" },
  { id: "CWE-1336", label: "Improper Neutralization of Special Elements Used in a Template Engine", url: "https://cwe.mitre.org/data/definitions/1336.html", category: "injection" },

  // ---- Access Control & Authorization (parent: CWE-284) ----
  { id: "CWE-284", label: "Improper Access Control", url: "https://cwe.mitre.org/data/definitions/284.html", category: "access-control", isParent: true },
  { id: "CWE-269", label: "Improper Privilege Management", url: "https://cwe.mitre.org/data/definitions/269.html", category: "access-control" },
  { id: "CWE-276", label: "Incorrect Default Permissions", url: "https://cwe.mitre.org/data/definitions/276.html", category: "access-control" },
  { id: "CWE-285", label: "Improper Authorization", url: "https://cwe.mitre.org/data/definitions/285.html", category: "access-control" },
  { id: "CWE-639", label: "Authorization Bypass Through User-Controlled Key", url: "https://cwe.mitre.org/data/definitions/639.html", category: "access-control" },
  { id: "CWE-732", label: "Incorrect Permission Assignment for Critical Resource", url: "https://cwe.mitre.org/data/definitions/732.html", category: "access-control" },
  { id: "CWE-862", label: "Missing Authorization", url: "https://cwe.mitre.org/data/definitions/862.html", category: "access-control" },
  { id: "CWE-863", label: "Incorrect Authorization", url: "https://cwe.mitre.org/data/definitions/863.html", category: "access-control" },
  { id: "CWE-918", label: "Server-Side Request Forgery (SSRF)", url: "https://cwe.mitre.org/data/definitions/918.html", category: "access-control" },

  // ---- Authentication & Session Management (parent: CWE-287) ----
  { id: "CWE-287", label: "Improper Authentication", url: "https://cwe.mitre.org/data/definitions/287.html", category: "auth-session", isParent: true },
  { id: "CWE-306", label: "Missing Authentication for Critical Function", url: "https://cwe.mitre.org/data/definitions/306.html", category: "auth-session" },
  { id: "CWE-307", label: "Improper Restriction of Excessive Authentication Attempts", url: "https://cwe.mitre.org/data/definitions/307.html", category: "auth-session" },
  { id: "CWE-384", label: "Session Fixation", url: "https://cwe.mitre.org/data/definitions/384.html", category: "auth-session" },
  { id: "CWE-521", label: "Weak Password Requirements", url: "https://cwe.mitre.org/data/definitions/521.html", category: "auth-session" },
  { id: "CWE-522", label: "Insufficiently Protected Credentials", url: "https://cwe.mitre.org/data/definitions/522.html", category: "auth-session" },
  { id: "CWE-613", label: "Insufficient Session Expiration", url: "https://cwe.mitre.org/data/definitions/613.html", category: "auth-session" },
  { id: "CWE-620", label: "Unverified Password Change", url: "https://cwe.mitre.org/data/definitions/620.html", category: "auth-session" },
  { id: "CWE-640", label: "Weak Password Recovery Mechanism for Forgotten Password", url: "https://cwe.mitre.org/data/definitions/640.html", category: "auth-session" },
  { id: "CWE-798", label: "Use of Hard-coded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html", category: "auth-session" },
  { id: "CWE-1391", label: "Use of Weak Credentials", url: "https://cwe.mitre.org/data/definitions/1391.html", category: "auth-session" },
  { id: "CWE-1392", label: "Use of Default Credentials", url: "https://cwe.mitre.org/data/definitions/1392.html", category: "auth-session" },

  // ---- Cryptographic Issues (parent: CWE-326) ----
  { id: "CWE-326", label: "Inadequate Encryption Strength", url: "https://cwe.mitre.org/data/definitions/326.html", category: "crypto", isParent: true },
  { id: "CWE-295", label: "Improper Certificate Validation", url: "https://cwe.mitre.org/data/definitions/295.html", category: "crypto" },
  { id: "CWE-312", label: "Cleartext Storage of Sensitive Information", url: "https://cwe.mitre.org/data/definitions/312.html", category: "crypto" },
  { id: "CWE-319", label: "Cleartext Transmission of Sensitive Information", url: "https://cwe.mitre.org/data/definitions/319.html", category: "crypto" },
  { id: "CWE-321", label: "Use of Hard-coded Cryptographic Key", url: "https://cwe.mitre.org/data/definitions/321.html", category: "crypto" },
  { id: "CWE-327", label: "Use of a Broken or Risky Cryptographic Algorithm", url: "https://cwe.mitre.org/data/definitions/327.html", category: "crypto" },
  { id: "CWE-330", label: "Use of Insufficiently Random Values", url: "https://cwe.mitre.org/data/definitions/330.html", category: "crypto" },
  { id: "CWE-916", label: "Use of Password Hash With Insufficient Computational Effort", url: "https://cwe.mitre.org/data/definitions/916.html", category: "crypto" },

  // ---- Information Disclosure (parent: CWE-200) ----
  { id: "CWE-200", label: "Exposure of Sensitive Information to an Unauthorized Actor", url: "https://cwe.mitre.org/data/definitions/200.html", category: "info-disclosure", isParent: true },
  { id: "CWE-209", label: "Generation of Error Message Containing Sensitive Information", url: "https://cwe.mitre.org/data/definitions/209.html", category: "info-disclosure" },
  { id: "CWE-532", label: "Insertion of Sensitive Information into Log File", url: "https://cwe.mitre.org/data/definitions/532.html", category: "info-disclosure" },
  { id: "CWE-538", label: "Insertion of Sensitive Information into Externally-Accessible File or Directory", url: "https://cwe.mitre.org/data/definitions/538.html", category: "info-disclosure" },

  // ---- Input Validation (parent: CWE-20) ----
  { id: "CWE-20", label: "Improper Input Validation", url: "https://cwe.mitre.org/data/definitions/20.html", category: "input-validation", isParent: true },
  { id: "CWE-129", label: "Improper Validation of Array Index", url: "https://cwe.mitre.org/data/definitions/129.html", category: "input-validation" },
  { id: "CWE-434", label: "Unrestricted Upload of File with Dangerous Type", url: "https://cwe.mitre.org/data/definitions/434.html", category: "input-validation" },
  { id: "CWE-470", label: "Use of Externally-Controlled Input to Select Classes or Code ('Unsafe Reflection')", url: "https://cwe.mitre.org/data/definitions/470.html", category: "input-validation" },
  { id: "CWE-472", label: "External Control of Assumed-Immutable Web Parameter", url: "https://cwe.mitre.org/data/definitions/472.html", category: "input-validation" },
  { id: "CWE-502", label: "Deserialization of Untrusted Data", url: "https://cwe.mitre.org/data/definitions/502.html", category: "input-validation" },
  { id: "CWE-915", label: "Improperly Controlled Modification of Dynamically-Determined Object Attributes", url: "https://cwe.mitre.org/data/definitions/915.html", category: "input-validation" },
  { id: "CWE-1236", label: "Improper Neutralization of Formula Elements in a CSV File", url: "https://cwe.mitre.org/data/definitions/1236.html", category: "input-validation" },

  // ---- Insecure Design & Configuration (no single natural parent) ----
  { id: "CWE-489", label: "Active Debug Code", url: "https://cwe.mitre.org/data/definitions/489.html", category: "insecure-design-config" },
  { id: "CWE-656", label: "Reliance on Security Through Obscurity", url: "https://cwe.mitre.org/data/definitions/656.html", category: "insecure-design-config" },
  { id: "CWE-942", label: "Permissive Cross-domain Security Policy with Untrusted Domains", url: "https://cwe.mitre.org/data/definitions/942.html", category: "insecure-design-config" },
  { id: "CWE-1188", label: "Initialization of a Resource with an Insecure Default", url: "https://cwe.mitre.org/data/definitions/1188.html", category: "insecure-design-config" },
  { id: "CWE-1104", label: "Use of Unmaintained Third Party Components", url: "https://cwe.mitre.org/data/definitions/1104.html", category: "insecure-design-config" },

  // ---- File & Resource Handling (parent: CWE-664) ----
  { id: "CWE-664", label: "Improper Control of a Resource Through its Lifetime", url: "https://cwe.mitre.org/data/definitions/664.html", category: "file-resource", isParent: true },
  { id: "CWE-22", label: "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')", url: "https://cwe.mitre.org/data/definitions/22.html", category: "file-resource" },
  { id: "CWE-73", label: "External Control of File Name or Path", url: "https://cwe.mitre.org/data/definitions/73.html", category: "file-resource" },
  { id: "CWE-400", label: "Uncontrolled Resource Consumption", url: "https://cwe.mitre.org/data/definitions/400.html", category: "file-resource" },

  // ---- Memory Safety (parent: CWE-119) ----
  {
    id: "CWE-119",
    label: "Improper Restriction of Operations within the Bounds of a Memory Buffer",
    url: "https://cwe.mitre.org/data/definitions/119.html",
    category: "memory-safety",
    isParent: true,
  },
  { id: "CWE-125", label: "Out-of-bounds Read", url: "https://cwe.mitre.org/data/definitions/125.html", category: "memory-safety" },
  { id: "CWE-190", label: "Integer Overflow or Wraparound", url: "https://cwe.mitre.org/data/definitions/190.html", category: "memory-safety" },
  { id: "CWE-416", label: "Use After Free", url: "https://cwe.mitre.org/data/definitions/416.html", category: "memory-safety" },
  { id: "CWE-476", label: "NULL Pointer Dereference", url: "https://cwe.mitre.org/data/definitions/476.html", category: "memory-safety" },
  { id: "CWE-787", label: "Out-of-bounds Write", url: "https://cwe.mitre.org/data/definitions/787.html", category: "memory-safety" },

  // ---- Race Conditions (parent: CWE-362) ----
  {
    id: "CWE-362",
    label: "Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')",
    url: "https://cwe.mitre.org/data/definitions/362.html",
    category: "race-condition",
    isParent: true,
  },
  { id: "CWE-366", label: "Race Condition within a Thread", url: "https://cwe.mitre.org/data/definitions/366.html", category: "race-condition" },
  { id: "CWE-367", label: "Time-of-check Time-of-use (TOCTOU) Race Condition", url: "https://cwe.mitre.org/data/definitions/367.html", category: "race-condition" },
  { id: "CWE-820", label: "Missing Synchronization", url: "https://cwe.mitre.org/data/definitions/820.html", category: "race-condition" },

  // ---- Client-Side & Request Forgery (no single natural parent) ----
  { id: "CWE-352", label: "Cross-Site Request Forgery (CSRF)", url: "https://cwe.mitre.org/data/definitions/352.html", category: "client-side" },
  { id: "CWE-601", label: "URL Redirection to Untrusted Site ('Open Redirect')", url: "https://cwe.mitre.org/data/definitions/601.html", category: "client-side" },
  { id: "CWE-1021", label: "Improper Restriction of Rendered UI Layers or Frames", url: "https://cwe.mitre.org/data/definitions/1021.html", category: "client-side" },
];

export const CWE_ENTRIES_BY_ID: Record<string, CweEntry> = Object.fromEntries(CWE_ENTRIES.map((c) => [c.id, c]));
