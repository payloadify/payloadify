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
    name: "Hash Identifier",
    shortDescription:
      "Identify a hash's likely type from its structure and length, with ranked candidates and matching Hashcat mode numbers.",
    status: "live",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    shortDescription:
      "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, and NTLM hashes from any text, instantly in your browser.",
    status: "live",
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
