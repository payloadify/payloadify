import { ChainPair } from "./types";
import { VULN_TYPES_BY_ID } from "./vulnTypes";

/**
 * Every unique unordered pair of the 16 VulnType families (vulnTypes.ts) — C(16,2) = 120
 * entries, one per pair, per the confirmed "fully hand-authored matrix" scope decision. No
 * runtime "no override" fallback exists; chaining.test.ts asserts this file has exactly one
 * entry for every pair and fails loudly if a family is added without its new pair entries.
 *
 * Each combined vector was authored by taking the more severe rating per metric between a
 * representative "worst case" template from each of the two families (per-metric severity
 * order: AV N>A>L>P, AC L>H, AT N>P, PR N>L>H, UI3.1 N>R, UI4.0 N>P>A, Scope C>U, all
 * Confidentiality/Integrity/Availability metrics H>L>N), then verified against this project's
 * own CVSS 3.1/4.0 scoring engines. The OWASP/VRT/CWE category shown for each pair is drawn
 * from whichever of the two parent families has the higher standalone CVSS 3.1 base score —
 * a systematic, reviewable rule rather than an invented "merged" category with no basis.
 */
export const CHAIN_MATRIX: ChainPair[] = [
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "sqli",
    label: "Cross-Site Scripting (XSS) chained with SQL Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and SQL Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "idor",
    label: "Cross-Site Scripting (XSS) chained with Insecure Direct Object Reference (IDOR)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=8.6
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Insecure Direct Object Reference (IDOR). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "broken-access-control",
    label: "Cross-Site Scripting (XSS) chained with Broken Access Control / Privilege Escalation",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.9 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Broken Access Control / Privilege Escalation. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "ssrf",
    label: "Cross-Site Scripting (XSS) chained with Server-Side Request Forgery (SSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Server-Side Request Forgery (SSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "csrf",
    label: "Cross-Site Scripting (XSS) chained with Cross-Site Request Forgery (CSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "Cross-Site Scripting (XSS) chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=8.6
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "open-redirect",
    label: "Cross-Site Scripting (XSS) chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "security-misconfiguration",
    label: "Cross-Site Scripting (XSS) chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "insecure-deserialization",
    label: "Cross-Site Scripting (XSS) chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "xxe",
    label: "Cross-Site Scripting (XSS) chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "path-traversal",
    label: "Cross-Site Scripting (XSS) chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "broken-authentication",
    label: "Cross-Site Scripting (XSS) chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "command-injection",
    label: "Cross-Site Scripting (XSS) chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "idor",
    label: "SQL Injection chained with Insecure Direct Object Reference (IDOR)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Insecure Direct Object Reference (IDOR). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "broken-access-control",
    label: "SQL Injection chained with Broken Access Control / Privilege Escalation",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Broken Access Control / Privilege Escalation. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "ssrf",
    label: "SQL Injection chained with Server-Side Request Forgery (SSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Server-Side Request Forgery (SSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "csrf",
    label: "SQL Injection chained with Cross-Site Request Forgery (CSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Cross-Site Request Forgery (CSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "SQL Injection chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"N","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "sqli-generic",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "open-redirect",
    label: "SQL Injection chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"L","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"L","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.3 4.0=8.8
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "sqli-generic",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "security-misconfiguration",
    label: "SQL Injection chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "insecure-deserialization",
    label: "SQL Injection chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a08-software-data-integrity",
    vrtRefId: "insecure-deserialization",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "xxe",
    label: "SQL Injection chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"N","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "sqli-generic",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "path-traversal",
    label: "SQL Injection chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"N","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "sqli-generic",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "broken-authentication",
    label: "SQL Injection chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "command-injection",
    label: "SQL Injection chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "broken-access-control",
    label: "Insecure Direct Object Reference (IDOR) chained with Broken Access Control / Privilege Escalation",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.9 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Broken Access Control / Privilege Escalation. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "ssrf",
    label: "Insecure Direct Object Reference (IDOR) chained with Server-Side Request Forgery (SSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Server-Side Request Forgery (SSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "csrf",
    label: "Insecure Direct Object Reference (IDOR) chained with Cross-Site Request Forgery (CSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Cross-Site Request Forgery (CSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "Insecure Direct Object Reference (IDOR) chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=8.1 4.0=8.6
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "open-redirect",
    label: "Insecure Direct Object Reference (IDOR) chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "security-misconfiguration",
    label: "Insecure Direct Object Reference (IDOR) chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "insecure-deserialization",
    label: "Insecure Direct Object Reference (IDOR) chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "xxe",
    label: "Insecure Direct Object Reference (IDOR) chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "path-traversal",
    label: "Insecure Direct Object Reference (IDOR) chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "broken-authentication",
    label: "Insecure Direct Object Reference (IDOR) chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "command-injection",
    label: "Insecure Direct Object Reference (IDOR) chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "ssrf",
    label: "Broken Access Control / Privilege Escalation chained with Server-Side Request Forgery (SSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=9.9 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Server-Side Request Forgery (SSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "csrf",
    label: "Broken Access Control / Privilege Escalation chained with Cross-Site Request Forgery (CSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Cross-Site Request Forgery (CSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "Broken Access Control / Privilege Escalation chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.9 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "open-redirect",
    label: "Broken Access Control / Privilege Escalation chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "security-misconfiguration",
    label: "Broken Access Control / Privilege Escalation chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "insecure-deserialization",
    label: "Broken Access Control / Privilege Escalation chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "xxe",
    label: "Broken Access Control / Privilege Escalation chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "path-traversal",
    label: "Broken Access Control / Privilege Escalation chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "broken-authentication",
    label: "Broken Access Control / Privilege Escalation chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "command-injection",
    label: "Broken Access Control / Privilege Escalation chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "csrf",
    label: "Server-Side Request Forgery (SSRF) chained with Cross-Site Request Forgery (CSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Cross-Site Request Forgery (CSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "Server-Side Request Forgery (SSRF) chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"N","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=8.4
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "open-redirect",
    label: "Server-Side Request Forgery (SSRF) chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"L","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "security-misconfiguration",
    label: "Server-Side Request Forgery (SSRF) chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "insecure-deserialization",
    label: "Server-Side Request Forgery (SSRF) chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "xxe",
    label: "Server-Side Request Forgery (SSRF) chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "path-traversal",
    label: "Server-Side Request Forgery (SSRF) chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "broken-authentication",
    label: "Server-Side Request Forgery (SSRF) chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "command-injection",
    label: "Server-Side Request Forgery (SSRF) chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "Cross-Site Request Forgery (CSRF) chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "open-redirect",
    label: "Cross-Site Request Forgery (CSRF) chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"R","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"P","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.3 4.0=8.6
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "security-misconfiguration",
    label: "Cross-Site Request Forgery (CSRF) chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "insecure-deserialization",
    label: "Cross-Site Request Forgery (CSRF) chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "xxe",
    label: "Cross-Site Request Forgery (CSRF) chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "path-traversal",
    label: "Cross-Site Request Forgery (CSRF) chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "broken-authentication",
    label: "Cross-Site Request Forgery (CSRF) chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "command-injection",
    label: "Cross-Site Request Forgery (CSRF) chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "open-redirect",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"L","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"L","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.3 4.0=8.8
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "open-redirect",
    cweId: "CWE-601",
    references: [
      { label: "PortSwigger: Open redirection", url: "https://portswigger.net/kb/issues/00500100_open-redirection-reflected" },
      { label: "OWASP Cheat Sheet: Unvalidated Redirects and Forwards", url: "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "security-misconfiguration",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "insecure-deserialization",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a08-software-data-integrity",
    vrtRefId: "insecure-deserialization",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "xxe",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"N","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "xxe",
    cweId: "CWE-611",
    references: [
      { label: "PortSwigger: XML external entity (XXE) injection", url: "https://portswigger.net/web-security/xxe" },
      { label: "OWASP Cheat Sheet: XXE Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "path-traversal",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"N","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "path-traversal",
    cweId: "CWE-22",
    references: [
      { label: "PortSwigger: Directory/path traversal", url: "https://portswigger.net/web-security/file-path-traversal" },
      { label: "OWASP: Path Traversal", url: "https://owasp.org/www-community/attacks/Path_Traversal" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "broken-authentication",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "command-injection",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "security-misconfiguration",
    label: "Open Redirect chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "insecure-deserialization",
    label: "Open Redirect chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"H","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"H","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9 4.0=9.2
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a08-software-data-integrity",
    vrtRefId: "insecure-deserialization",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "xxe",
    label: "Open Redirect chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"L","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"L","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.3 4.0=8.8
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "xxe",
    cweId: "CWE-611",
    references: [
      { label: "PortSwigger: XML external entity (XXE) injection", url: "https://portswigger.net/web-security/xxe" },
      { label: "OWASP Cheat Sheet: XXE Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "path-traversal",
    label: "Open Redirect chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"L","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"L","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.3 4.0=8.8
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "path-traversal",
    cweId: "CWE-22",
    references: [
      { label: "PortSwigger: Directory/path traversal", url: "https://portswigger.net/web-security/file-path-traversal" },
      { label: "OWASP: Path Traversal", url: "https://owasp.org/www-community/attacks/Path_Traversal" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "broken-authentication",
    label: "Open Redirect chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "command-injection",
    label: "Open Redirect chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "security-misconfiguration",
    vulnTypeIdB: "insecure-deserialization",
    label: "Security Misconfiguration chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Security Misconfiguration and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "security-misconfiguration",
    vulnTypeIdB: "xxe",
    label: "Security Misconfiguration chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Security Misconfiguration and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "security-misconfiguration",
    vulnTypeIdB: "path-traversal",
    label: "Security Misconfiguration chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Security Misconfiguration and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "security-misconfiguration",
    vulnTypeIdB: "broken-authentication",
    label: "Security Misconfiguration chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Security Misconfiguration and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "security-misconfiguration",
    vulnTypeIdB: "command-injection",
    label: "Security Misconfiguration chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Security Misconfiguration and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "insecure-deserialization",
    vulnTypeIdB: "xxe",
    label: "Insecure Deserialization chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Deserialization and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a08-software-data-integrity",
    vrtRefId: "insecure-deserialization",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "insecure-deserialization",
    vulnTypeIdB: "path-traversal",
    label: "Insecure Deserialization chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Deserialization and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a08-software-data-integrity",
    vrtRefId: "insecure-deserialization",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "insecure-deserialization",
    vulnTypeIdB: "broken-authentication",
    label: "Insecure Deserialization chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Deserialization and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "insecure-deserialization",
    vulnTypeIdB: "command-injection",
    label: "Insecure Deserialization chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Deserialization and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xxe",
    vulnTypeIdB: "path-traversal",
    label: "XML External Entity (XXE) Injection chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"N","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"N","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between XML External Entity (XXE) Injection and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "xxe",
    cweId: "CWE-611",
    references: [
      { label: "PortSwigger: XML external entity (XXE) injection", url: "https://portswigger.net/web-security/xxe" },
      { label: "OWASP Cheat Sheet: XXE Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xxe",
    vulnTypeIdB: "broken-authentication",
    label: "XML External Entity (XXE) Injection chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between XML External Entity (XXE) Injection and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "xxe",
    vulnTypeIdB: "command-injection",
    label: "XML External Entity (XXE) Injection chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between XML External Entity (XXE) Injection and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "path-traversal",
    vulnTypeIdB: "broken-authentication",
    label: "Path Traversal / Local File Inclusion chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Path Traversal / Local File Inclusion and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "path-traversal",
    vulnTypeIdB: "command-injection",
    label: "Path Traversal / Local File Inclusion chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Path Traversal / Local File Inclusion and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "broken-authentication",
    vulnTypeIdB: "command-injection",
    label: "Broken Authentication / Session Management chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Authentication / Session Management and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },

  // ---- parameter-tampering x each pre-existing family ----
  // Parameter Tampering's own "worst case" vector (across its web/API/mobile templates) is
  // {AV:N,AC:L,PR:L,UI:N,S:C,C:H,I:H,A:H} (3.1 base 9.9) / {AV:N,AC:L,AT:N,PR:L,UI:N,VC:H,VI:H,
  // VA:H,SC:N,SI:N,SA:N} (4.0 base 8.7) — combined against each other family the same way as the
  // rest of this matrix. Where Parameter Tampering wins, its category defaults to A04:2021
  // Insecure Design / CWE-472 (the same default used by its own web template and vrtAutofill.ts),
  // since a chain pair carries a single category regardless of platform.
  {
    vulnTypeIdA: "xss",
    vulnTypeIdB: "parameter-tampering",
    label: "Cross-Site Scripting (XSS) chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Scripting (XSS) and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "sqli",
    vulnTypeIdB: "parameter-tampering",
    label: "SQL Injection chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3 — Parameter Tampering's own worst case (9.9) now edges out SQLi's (8.2)
    rationale: "Combined by taking the more severe rating per metric between SQL Injection and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "idor",
    vulnTypeIdB: "parameter-tampering",
    label: "Insecure Direct Object Reference (IDOR) chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Direct Object Reference (IDOR) and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "broken-access-control",
    vulnTypeIdB: "parameter-tampering",
    label: "Broken Access Control / Privilege Escalation chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Access Control / Privilege Escalation and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "ssrf",
    vulnTypeIdB: "parameter-tampering",
    label: "Server-Side Request Forgery (SSRF) chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Server-Side Request Forgery (SSRF) and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "csrf",
    vulnTypeIdB: "parameter-tampering",
    label: "Cross-Site Request Forgery (CSRF) chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Cross-Site Request Forgery (CSRF) and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "sensitive-data-exposure",
    vulnTypeIdB: "parameter-tampering",
    label: "Sensitive Data Exposure / Cryptographic Failures chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"L","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between Sensitive Data Exposure / Cryptographic Failures and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "open-redirect",
    vulnTypeIdB: "parameter-tampering",
    label: "Open Redirect chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Open Redirect and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "security-misconfiguration",
    vulnTypeIdB: "parameter-tampering",
    label: "Security Misconfiguration chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Security Misconfiguration and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "insecure-deserialization",
    vulnTypeIdB: "parameter-tampering",
    label: "Insecure Deserialization chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Insecure Deserialization and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "xxe",
    vulnTypeIdB: "parameter-tampering",
    label: "XML External Entity (XXE) Injection chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"H","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.9
    rationale: "Combined by taking the more severe rating per metric between XML External Entity (XXE) Injection and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "path-traversal",
    vulnTypeIdB: "parameter-tampering",
    label: "Path Traversal / Local File Inclusion chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Path Traversal / Local File Inclusion and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "broken-authentication",
    vulnTypeIdB: "parameter-tampering",
    label: "Broken Authentication / Session Management chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Broken Authentication / Session Management and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "command-injection",
    vulnTypeIdB: "parameter-tampering",
    label: "OS Command Injection chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between OS Command Injection and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },

  // ---- race-condition (added after the original 15-family / 105-pair matrix; the race-
  // condition side of every merge below uses its own worst-case template, the double-spend
  // scenario: AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N) ----
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "xss",
    label: "Race Condition (TOCTOU) chained with Cross-Site Scripting (XSS)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=8.6
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Cross-Site Scripting (XSS). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "xss-stored",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "sqli",
    label: "Race Condition (TOCTOU) chained with SQL Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"L"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"L","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.4 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and SQL Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "sqli-generic",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "idor",
    label: "Race Condition (TOCTOU) chained with Insecure Direct Object Reference (IDOR)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=8.1 4.0=8.6
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Insecure Direct Object Reference (IDOR). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "idor",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "broken-access-control",
    label: "Race Condition (TOCTOU) chained with Broken Access Control / Privilege Escalation",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.9 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Broken Access Control / Privilege Escalation. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "ssrf",
    label: "Race Condition (TOCTOU) chained with Server-Side Request Forgery (SSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"L","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"L","UI":"N","VC":"L","VI":"H","VA":"N","SC":"H","SI":"H","SA":"N","E":"X"},
    // combined score 3.1=9.6 4.0=8.4
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Server-Side Request Forgery (SSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a10-ssrf",
    vrtRefId: "ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "csrf",
    label: "Race Condition (TOCTOU) chained with Cross-Site Request Forgery (CSRF)",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Cross-Site Request Forgery (CSRF). Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "csrf",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "sensitive-data-exposure",
    label: "Race Condition (TOCTOU) chained with Sensitive Data Exposure / Cryptographic Failures",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Sensitive Data Exposure / Cryptographic Failures. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "server-security-misconfiguration-race-condition",
    cweId: "CWE-362",
    references: [
      { label: "PortSwigger: Race conditions", url: "https://portswigger.net/web-security/race-conditions" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "open-redirect",
    label: "Race Condition (TOCTOU) chained with Open Redirect",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"C","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=10 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Open Redirect. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "open-redirect",
    cweId: "CWE-601",
    references: [
      { label: "PortSwigger: Open redirection", url: "https://portswigger.net/kb/issues/00500100_open-redirection-reflected" },
      { label: "OWASP Cheat Sheet: Unvalidated Redirects and Forwards", url: "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "security-misconfiguration",
    label: "Race Condition (TOCTOU) chained with Security Misconfiguration",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Security Misconfiguration. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "insecure-deserialization",
    label: "Race Condition (TOCTOU) chained with Insecure Deserialization",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Insecure Deserialization. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a08-software-data-integrity",
    vrtRefId: "insecure-deserialization",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "xxe",
    label: "Race Condition (TOCTOU) chained with XML External Entity (XXE) Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and XML External Entity (XXE) Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a05-security-misconfiguration",
    vrtRefId: "xxe",
    cweId: "CWE-611",
    references: [
      { label: "PortSwigger: XML external entity (XXE) injection", url: "https://portswigger.net/web-security/xxe" },
      { label: "OWASP Cheat Sheet: XXE Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "path-traversal",
    label: "Race Condition (TOCTOU) chained with Path Traversal / Local File Inclusion",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Path Traversal / Local File Inclusion. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a01-broken-access-control",
    vrtRefId: "path-traversal",
    cweId: "CWE-22",
    references: [
      { label: "PortSwigger: Directory/path traversal", url: "https://portswigger.net/web-security/file-path-traversal" },
      { label: "OWASP: Path Traversal", url: "https://owasp.org/www-community/attacks/Path_Traversal" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "broken-authentication",
    label: "Race Condition (TOCTOU) chained with Broken Authentication / Session Management",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.1 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Broken Authentication / Session Management. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a07-auth-failures",
    vrtRefId: "broken-authentication",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "command-injection",
    label: "Race Condition (TOCTOU) chained with OS Command Injection",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"H","I":"H","A":"H"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"H","VI":"H","VA":"H","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=9.8 4.0=9.3
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and OS Command Injection. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a03-injection",
    vrtRefId: "command-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  {
    vulnTypeIdA: "race-condition",
    vulnTypeIdB: "parameter-tampering",
    label: "Race Condition (TOCTOU) chained with Parameter Tampering",
    cvss31: {"AV":"N","AC":"L","PR":"N","UI":"N","S":"U","C":"N","I":"H","A":"N"},
    cvss40: {"AV":"N","AC":"L","AT":"N","PR":"N","UI":"N","VC":"N","VI":"H","VA":"N","SC":"N","SI":"N","SA":"N","E":"X"},
    // combined score 3.1=7.5 4.0=8.7
    rationale: "Combined by taking the more severe rating per metric between Race Condition (TOCTOU) and Parameter Tampering. Category shown reflects whichever of the two carries the higher standalone severity.",
    owaspRefId: "web-a04-insecure-design",
    vrtRefId: "parameter-tampering",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
];

/** Looks up the chain pair for two vuln-type ids, checking both orders. Returns undefined
 *  only for a self-pair (idA === idB) — every distinct pair is guaranteed present, see the
 *  module doc comment above and chaining.test.ts's full-coverage assertion. */
export function findChainPair(idA: string, idB: string): ChainPair | undefined {
  if (idA === idB) return undefined;
  return CHAIN_MATRIX.find(
    (pair) => (pair.vulnTypeIdA === idA && pair.vulnTypeIdB === idB) || (pair.vulnTypeIdA === idB && pair.vulnTypeIdB === idA),
  );
}

function chainPairKey(idA: string, idB: string): string {
  return [idA, idB].sort().join("|");
}

/** Hand-written combined-impact write-ups for the handful of chain pairs that are especially
 *  common and well-documented in real pentest findings. Deliberately NOT exhaustive — per the
 *  "no auto-generated combined descriptions" scope decision, every other pair gets a scaffold
 *  prompt from getChainedImpactDraft() below rather than a guessed narrative. Add to this list
 *  only for pairs you can point to real, well-documented attack paths for. */
const CURATED_CHAIN_IMPACT: Record<string, string> = {
  [chainPairKey("xss", "broken-authentication")]:
    "Chaining Cross-Site Scripting with Broken Authentication / Session Management: injected JavaScript can read a session cookie or bearer token that weak session-management practices (e.g. missing HttpOnly, non-expiring tokens) leave exposed, letting the attacker hijack the victim's authenticated session without ever learning their password.",
  [chainPairKey("idor", "broken-access-control")]:
    "Chaining Insecure Direct Object Reference (IDOR) with Broken Access Control / Privilege Escalation: an object-level authorization gap that lets an attacker enumerate or modify another user's records is compounded by a missing role check on the same functionality, turning a horizontal data-access issue into a route to administrative or otherwise privileged actions.",
  [chainPairKey("ssrf", "sensitive-data-exposure")]:
    "Chaining Server-Side Request Forgery (SSRF) with Sensitive Data Exposure / Cryptographic Failures: the forged server-side request is pointed at the cloud provider's instance metadata service or another internal secrets endpoint, and the credentials or tokens returned there are the sensitive data exposed, turning a request-forgery primitive into direct compromise of the provider account or downstream services those credentials unlock.",
  [chainPairKey("sqli", "command-injection")]:
    "Chaining SQL Injection with OS Command Injection: once injection into the query is confirmed, database-specific command-execution features are used to escalate from data access to full host compromise: MSSQL's xp_cmdshell, MySQL's INTO OUTFILE to drop a web shell into a web-accessible directory, or PostgreSQL's COPY TO/FROM PROGRAM. This is one of the most well-documented SQLi escalation paths and turns a data-disclosure finding into remote code execution on the database host.",
  [chainPairKey("broken-access-control", "sensitive-data-exposure")]:
    "Chaining Broken Access Control / Privilege Escalation with Sensitive Data Exposure / Cryptographic Failures: reaching functionality or an object tier the missing authorization check should have blocked exposes data (other users' records, admin-only exports, credentials) that was only ever protected by that same access-control gate, turning a single broken check into bulk, unauthorized data disclosure rather than a one-off action.",
  [chainPairKey("ssrf", "xxe")]:
    "Chaining Server-Side Request Forgery (SSRF) with XML External Entity (XXE) Injection: the XML parser's own external-entity resolution is the SSRF primitive: a custom entity is defined pointing at an internal host, cloud metadata endpoint, or otherwise unreachable service, and the parser (not a dedicated URL-fetch feature) is what issues the request. Especially relevant for blind XXE, where an out-of-band external DTD is often the only way to confirm and extract data from the reached destination.",
};

/** Draft for the "Chained Impact" field: a curated write-up for the pairs above, otherwise a
 *  scaffold prompt for the user to fill in themselves rather than a guessed claim across every
 *  possible pairing. "" if either id is missing. */
export function getChainedImpactDraft(vulnTypeIdA: string | null, vulnTypeIdB: string | null): string {
  if (!vulnTypeIdA || !vulnTypeIdB) return "";
  const curated = CURATED_CHAIN_IMPACT[chainPairKey(vulnTypeIdA, vulnTypeIdB)];
  if (curated) return curated;
  const labelA = VULN_TYPES_BY_ID[vulnTypeIdA]?.label ?? vulnTypeIdA;
  const labelB = VULN_TYPES_BY_ID[vulnTypeIdB]?.label ?? vulnTypeIdB;
  return `Combining ${labelA} with ${labelB} may increase impact: describe the specific attack path here.`;
}
