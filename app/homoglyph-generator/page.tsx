import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { HomoglyphTabs } from "@/components/tools/homoglyph-shared/HomoglyphTabs";
import { HomoglyphGeneratorTool } from "@/components/tools/homoglyph-generator/HomoglyphGeneratorTool";

export const metadata: Metadata = {
  title: "Homoglyph Generator — Create Lookalike Unicode Text",
  description:
    "Generate homoglyph-substituted lookalike text using confusable Unicode characters — randomize or hand-pick specific substitutions, free, entirely in your browser.",
};

export default function HomoglyphGeneratorPage() {
  return (
    <ToolPageLayout
      title="Homoglyph Generator"
      description="Generate a homoglyph-substituted lookalike version of your text. Randomize every eligible character, or pick a specific substitution for each one."
    >
      <HomoglyphTabs active="generate" />
      <HomoglyphGeneratorTool />
    </ToolPageLayout>
  );
}
