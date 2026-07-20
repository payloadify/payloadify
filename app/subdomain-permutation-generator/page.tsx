import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { SubdomainPermutationGeneratorTool } from "@/components/tools/subdomain-permutation-generator/SubdomainPermutationGeneratorTool";

export const metadata: Metadata = {
  title: "Subdomain Permutation Generator: Build Subdomain Wordlists for massdns/puredns",
  description:
    "Generate candidate subdomain wordlists by permuting a target domain with environment, service, and region tokens plus your own keywords. No DNS lookups, pipe the output straight into massdns, puredns, or dnsx. Free, entirely in your browser.",
};

export default function SubdomainPermutationGeneratorPage() {
  return (
    <ToolPageLayout
      title="Subdomain Permutation Generator"
      description="Turn a base domain into a resolver-ready wordlist: toggle environment, service, and region tokens, add your own keywords, and generate. This tool only builds the list; it never queries DNS."
    >
      <SubdomainPermutationGeneratorTool />
    </ToolPageLayout>
  );
}
