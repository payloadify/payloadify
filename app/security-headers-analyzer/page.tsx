import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { SecurityHeadersAnalyzerTool } from "@/components/tools/security-headers-analyzer/SecurityHeadersAnalyzerTool";

export const metadata: Metadata = {
  title: "HTTP Security Headers Analyzer — Check Any URL",
  description:
    "Fetch any URL's response headers and check them against the OWASP Secure Headers Project — HSTS, CSP, X-Frame-Options, and more — with pass/warn/missing status and plain-language fixes.",
};

export default function SecurityHeadersAnalyzerPage() {
  return (
    <ToolPageLayout
      title="HTTP Security Headers Analyzer"
      description="Enter a URL to check its response headers against the OWASP Secure Headers Project — see what's present, what's missing, and what to fix, with copy-ready findings."
    >
      <SecurityHeadersAnalyzerTool />
    </ToolPageLayout>
  );
}
