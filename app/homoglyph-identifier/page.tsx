import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { HomoglyphTabs } from "@/components/tools/homoglyph-shared/HomoglyphTabs";
import { HomoglyphIdentifierTool } from "@/components/tools/homoglyph-identifier/HomoglyphIdentifierTool";

export const metadata: Metadata = {
  title: "Homoglyph Identifier — Detect Confusable Unicode Characters",
  description:
    "Paste a domain name or other text to detect homoglyph/confusable Unicode characters — spot spoofed lookalike letters used in phishing and typosquatting, free, entirely in your browser.",
};

export default function HomoglyphIdentifierPage() {
  return (
    <ToolPageLayout
      title="Homoglyph Identifier"
      description="Detect Unicode homoglyph/confusable characters in text — flag lookalike letters from other scripts (or other Latin sequences) used to spoof domains and identifiers."
    >
      <HomoglyphTabs active="identify" />
      <HomoglyphIdentifierTool />
    </ToolPageLayout>
  );
}
