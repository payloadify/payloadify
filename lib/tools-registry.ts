export type Tool = {
  slug: string;
  name: string;
  /** One short line: what the tool does. */
  tagline: string;
  /** One short line: what it supports/covers. Optional, shown under the tagline. */
  supports?: string;
  /** Muted metadata chips shown on the tool card, e.g. ["Decode", "Edit", "Sign"]. */
  meta: string[];
  status: "live" | "coming-soon";
};

export const tools: Tool[] = [
  {
    slug: "jwt-decoder",
    name: "JWT Decoder/Tamper & Generator",
    tagline: "Decode, edit, and re-sign JWTs.",
    supports: "Flags alg:none and weak signing. HMAC, RSA, ECDSA, RSA-PSS.",
    meta: ["Decode", "Edit", "Sign"],
    status: "live",
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    tagline: "Build and sign a brand-new JWT.",
    supports: "HMAC, RSA, ECDSA, RSA-PSS. Secrets, keypairs, claims, scenario presets.",
    meta: ["HMAC", "RSA", "ECDSA", "RSA-PSS"],
    status: "live",
  },
  {
    slug: "hash-identifier",
    name: "Hash Identifier/Generator",
    tagline: "Identify a hash's likely type, or generate one from text.",
    supports: "Ranked candidates with Hashcat mode numbers. MD5, SHA-1/256/384/512, NTLM.",
    meta: ["MD5", "SHA-1", "SHA-256", "NTLM"],
    status: "live",
  },
  {
    slug: "payload-encoder",
    name: "Payload Encoder/Decoder",
    tagline: "Chain encoding and decoding steps into one pipeline.",
    supports: "Base64, Hex, URL, and HTML-entity, in any order.",
    meta: ["Base64", "Hex", "URL", "HTML Entity"],
    status: "live",
  },
  {
    slug: "homoglyph-identifier",
    name: "Homoglyph Identifier/Generator",
    tagline: "Detect or generate Unicode homoglyph lookalikes.",
    supports: "Spot spoofed domains and confusable characters in suspicious text.",
    meta: ["Detect", "Generate"],
    status: "live",
  },
  {
    slug: "xss-generator",
    name: "XSS Payload Generator",
    tagline: "Generate XSS payloads.",
    supports: "Reflected, stored, DOM-based, WAF bypass, and encoding techniques.",
    meta: ["Reflected", "Stored", "DOM", "WAF Bypass"],
    status: "live",
  },
  {
    slug: "sqli-generator",
    name: "SQLi Payload Generator",
    tagline: "Build SQL injection payloads.",
    supports: "MySQL, MSSQL, PostgreSQL, Oracle, SQLite. Info extraction, WAF evasion.",
    meta: ["MySQL", "MSSQL", "PostgreSQL", "Oracle"],
    status: "live",
  },
  {
    slug: "reverse-shell-generator",
    name: "Reverse Shell Generator",
    tagline: "Generate reverse shell one-liners.",
    supports: "Matching listener command and save-as-file options included.",
    meta: ["Bash", "Netcat", "Python", "PowerShell"],
    status: "live",
  },
  {
    slug: "msfvenom-generator",
    name: "MSFVenom Command Generator",
    tagline: "Build msfvenom commands from template presets.",
    supports: "Windows, Linux, macOS, Android. Evasion encoders, listener setup guide.",
    meta: ["Windows", "Linux", "macOS", "Android"],
    status: "live",
  },
  {
    slug: "cvss-calculator",
    name: "CVSS 3.1 / 4.0 Calculator",
    tagline: "Click through CVSS metrics to get an instant score.",
    supports: "Severity, OWASP/VRT/CWE mapping, copy-ready vector string.",
    meta: ["CVSS 3.1", "CVSS 4.0"],
    status: "live",
  },
  {
    slug: "subdomain-permutation-generator",
    name: "Subdomain Permutation Generator",
    tagline: "Generate candidate subdomain wordlists.",
    supports: "Environment/service/region tokens plus your own keywords. Dedup'd and capped.",
    meta: ["massdns", "puredns", "dnsx"],
    status: "live",
  },
  {
    slug: "security-headers-analyzer",
    name: "HTTP Security Headers Analyzer",
    tagline: "Fetch any URL's response headers and audit them.",
    supports: "Checked against OWASP Secure Headers Project. Pass/warn/missing status.",
    meta: ["HSTS", "CSP", "X-Frame-Options"],
    status: "live",
  },
  {
    slug: "spf-dkim-dmarc-checker",
    name: "SPF / DKIM / DMARC Checker",
    tagline: "Check a domain's email authentication setup.",
    supports: "Parsed mechanisms, policy explanations, misconfiguration flags.",
    meta: ["SPF", "DKIM", "DMARC"],
    status: "live",
  },
  {
    slug: "hashcat-generator",
    name: "Hashcat Command Generator",
    tagline: "Build a complete hashcat command.",
    supports: "Mode, attack type, wordlists, masks, rules, advanced flags.",
    meta: ["Wordlist", "Mask", "Rules"],
    status: "live",
  },
  {
    slug: "nmap-generator",
    name: "Nmap Command Generator",
    tagline: "Build nmap commands from scenario templates.",
    supports: "Fast, stealth, full port, vuln scripts, timing presets, or hand-tune every flag.",
    meta: ["Fast Scan", "Full Scan", "NSE"],
    status: "live",
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
