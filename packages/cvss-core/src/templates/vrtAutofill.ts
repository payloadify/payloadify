import { CvssReference } from "./types";

export interface VrtAutofillEntry {
  owaspRefId: string | null;
  cweId: string;
  references: CvssReference[];
}

/** Suggested OWASP category + CWE + references to autofill when the user manually picks a VRT
 *  category in the Additional Info editor (custom/no-template mode) — a starting point only,
 *  the user can change or delete any of it afterward. Values mirror the canonical per-vuln-type
 *  defaults already used by templates.ts/chaining.ts (the three XSS VRT sub-variants and the
 *  single SQLi VRT id all resolve to their shared parent family's defaults). */
export const VRT_AUTOFILL: Record<string, VrtAutofillEntry> = {
  "xss-reflected": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  "xss-stored": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  "xss-dom": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  "sqli-generic": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  idor: {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  "broken-access-control": {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  ssrf: {
    owaspRefId: "web-a10-ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  csrf: {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  "sensitive-data-exposure": {
    owaspRefId: "web-a02-crypto-failures",
    cweId: "CWE-200",
    references: [
      { label: "PortSwigger: Information disclosure", url: "https://portswigger.net/web-security/information-disclosure" },
      { label: "OWASP Top 10 2021: A02 Cryptographic Failures", url: "https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/" },
    ],
  },
  "open-redirect": {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-601",
    references: [
      { label: "PortSwigger: Open redirection", url: "https://portswigger.net/kb/issues/00500100_open-redirection-reflected" },
      { label: "OWASP Cheat Sheet: Unvalidated Redirects and Forwards", url: "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html" },
    ],
  },
  "security-misconfiguration": {
    owaspRefId: "web-a05-security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  "insecure-deserialization": {
    owaspRefId: "web-a08-software-data-integrity",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  xxe: {
    owaspRefId: "web-a05-security-misconfiguration",
    cweId: "CWE-611",
    references: [
      { label: "PortSwigger: XML external entity (XXE) injection", url: "https://portswigger.net/web-security/xxe" },
      { label: "OWASP Cheat Sheet: XXE Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html" },
    ],
  },
  "path-traversal": {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-22",
    references: [
      { label: "PortSwigger: Directory/path traversal", url: "https://portswigger.net/web-security/file-path-traversal" },
      { label: "OWASP: Path Traversal", url: "https://owasp.org/www-community/attacks/Path_Traversal" },
    ],
  },
  "broken-authentication": {
    owaspRefId: "web-a07-auth-failures",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  "command-injection": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  "parameter-tampering": {
    owaspRefId: "web-a04-insecure-design",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
};
