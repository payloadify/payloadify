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
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
