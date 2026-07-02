export type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  status: "live" | "coming-soon";
};

export const tools: Tool[] = [
  {
    slug: "jwt-decoder",
    name: "JWT Decoder/Tamper",
    shortDescription:
      "Decode JWT header and payload, flag alg:none and weak signing, edit claims and re-sign.",
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
    slug: "payload-encode",
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
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
