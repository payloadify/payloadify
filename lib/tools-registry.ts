export type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  status: "live" | "coming-soon";
};

export const tools: Tool[] = [
  {
    slug: "jwt-decoder",
    name: "JWT Decoder/Tamper & Generator",
    shortDescription:
      "Decode JWT header and payload, flag alg:none and weak signing, edit claims and re-sign, or build and sign a brand-new token with HMAC, RSA, ECDSA, or RSA-PSS.",
    status: "live",
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    shortDescription:
      "Build and sign a JWT with HMAC, RSA, ECDSA, or RSA-PSS. Generate secrets or keypairs, quick-add claims, scenario presets, and weakness flags.",
    status: "live",
  },
  {
    slug: "hash-identifier",
    name: "Hash Identifier/Generator",
    shortDescription:
      "Identify a hash's likely type with ranked candidates and matching Hashcat mode numbers, or generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, and NTLM hashes from text.",
    status: "live",
  },
  {
    slug: "payload-encoder",
    name: "Payload Encoder/Decoder",
    shortDescription:
      "Chain Base64, Hex, URL, and HTML-entity encoding and decoding steps to build or unwrap obfuscated payloads.",
    status: "live",
  },
  {
    slug: "homoglyph-identifier",
    name: "Homoglyph Identifier/Generator",
    shortDescription:
      "Detect Unicode homoglyph/confusable characters in suspicious text (e.g. spoofed domains), or generate homoglyph-substituted lookalike strings.",
    status: "live",
  },
  {
    slug: "xss-generator",
    name: "XSS Payload Generator",
    shortDescription:
      "Generate XSS payloads across basic to advanced WAF-bypass and encoding techniques, for reflected/stored or DOM-based contexts.",
    status: "live",
  },
  {
    slug: "sqli-generator",
    name: "SQLi Payload Generator",
    shortDescription:
      "Build SQL injection payloads across MySQL, MSSQL, PostgreSQL, Oracle, and SQLite, with chainable info extraction, WAF-evasion obfuscation, and blacklist-character avoidance.",
    status: "live",
  },
  {
    slug: "reverse-shell-generator",
    name: "Reverse Shell Generator",
    shortDescription:
      "Generate reverse shell one-liners across Bash, Netcat, Python, PHP, Perl, Ruby, Socat, Awk, Telnet, Node.js, Lua, Golang, and PowerShell, with a matching listener command and save-as-file options.",
    status: "live",
  },
  {
    slug: "msfvenom-generator",
    name: "MSFVenom Command Generator",
    shortDescription:
      "Build msfvenom commands with template presets for Windows, Linux, macOS, and Android payloads, evasion encoders, and architectures. Copy-ready, with a listener setup guide.",
    status: "live",
  },
  {
    slug: "cvss-calculator",
    name: "CVSS 3.1 / 4.0 Calculator",
    shortDescription:
      "Click through CVSS 3.1 and 4.0 base metrics, or pick a vulnerability scenario template, to get an instant score, severity, OWASP/VRT/CWE mapping, and copy-ready vector string.",
    status: "live",
  },
  {
    slug: "subdomain-permutation-generator",
    name: "Subdomain Permutation Generator",
    shortDescription:
      "Generate candidate subdomain wordlists from a base domain, environment/service/region tokens, and your own keywords. Dedup'd, capped, and ready to pipe into massdns/puredns/dnsx. No DNS lookups happen here.",
    status: "live",
  },
  {
    slug: "security-headers-analyzer",
    name: "HTTP Security Headers Analyzer",
    shortDescription:
      "Fetch any URL's response headers and check them against the OWASP Secure Headers Project (HSTS, CSP, X-Frame-Options, and more), with pass/warn/missing status, plain-language explanations, and copy-ready findings.",
    status: "live",
  },
  {
    slug: "spf-dkim-dmarc-checker",
    name: "SPF / DKIM / DMARC Checker",
    shortDescription:
      "Check a domain's SPF, DKIM, and DMARC records: parsed mechanisms, policy explanations, and common misconfiguration flags (multiple SPF records, revoked DKIM keys, monitoring-only DMARC), with copy-ready results.",
    status: "live",
  },
  {
    slug: "hashcat-generator",
    name: "Hashcat Command Generator",
    shortDescription:
      "Build a complete hashcat command: mode, attack type, wordlists, masks, rules, and advanced flags. Pre-filled with the mode number when you arrive from the Hash Identifier.",
    status: "live",
  },
  {
    slug: "nmap-generator",
    name: "Nmap Command Generator",
    shortDescription:
      "Build nmap commands from 8 optimized scenario templates (fast scan, stealth, full port, vuln scripts, and more), or hand-tune every flag in Custom Build mode: scan type, ports, timing, service/OS detection, NSE scripts, and evasion.",
    status: "live",
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
