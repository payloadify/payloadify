import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { CvssCalculatorTool } from "@/components/tools/cvss-calculator/CvssCalculatorTool";

export const metadata: Metadata = {
  title: "CVSS 3.1 / 4.0 Calculator: Score Vulnerabilities Fast",
  description:
    "Click through CVSS 3.1 and 4.0 base metrics to get an instant, spec-correct base score, severity rating, and vector string (free, entirely in your browser).",
};

export default function CvssCalculatorPage() {
  return (
    <ToolPageLayout
      title="CVSS 3.1 / 4.0 Calculator"
      description="Pick the base metrics that describe a vulnerability to get an instant base score, severity rating, and copy-ready vector string for both CVSS 3.1 and 4.0."
    >
      <CvssCalculatorTool />
    </ToolPageLayout>
  );
}
