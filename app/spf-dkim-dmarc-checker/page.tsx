import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { SpfDkimDmarcCheckerTool } from "@/components/tools/spf-dkim-dmarc-checker/SpfDkimDmarcCheckerTool";

export const metadata: Metadata = {
  title: "SPF, DKIM & DMARC Checker — Email Authentication Lookup",
  description:
    "Check a domain's SPF, DKIM, and DMARC records — parsed mechanisms, policy explanations, common misconfiguration flags (multiple SPF records, revoked DKIM keys, monitoring-only DMARC), and copy-ready results.",
};

export default function SpfDkimDmarcCheckerPage() {
  return (
    <ToolPageLayout
      title="SPF / DKIM / DMARC Checker"
      description="Enter a domain to check its email authentication setup — SPF record and mechanisms, DKIM selectors, and DMARC policy — with plain-language explanations and copy-ready results."
    >
      <SpfDkimDmarcCheckerTool />
    </ToolPageLayout>
  );
}
