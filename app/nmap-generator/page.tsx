import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { NmapGeneratorTool } from "@/components/tools/nmap-generator/NmapGeneratorTool";

export const metadata: Metadata = {
  title: "Nmap Command Generator: Build Nmap Commands in One Click",
  description:
    "Build a complete nmap command from optimized scenario templates (fast, stealth, full port, vulnerability scan, and more), or hand-tune every flag yourself: scan type, ports, timing, service/OS detection, NSE scripts, and evasion. Free, entirely in your browser.",
};

export default function NmapGeneratorPage() {
  return (
    <ToolPageLayout
      title="Nmap Command Generator"
      description="Pick a ready-made scenario template, or switch to Custom Build and hand-tune every flag yourself. Get a copy-ready nmap command without hunting through the man page."
    >
      <NmapGeneratorTool />
    </ToolPageLayout>
  );
}
