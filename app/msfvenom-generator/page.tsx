import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { MsfvenomGeneratorTool } from "@/components/tools/msfvenom-generator/MsfvenomGeneratorTool";

export const metadata: Metadata = {
  title: "MSFVenom Command Generator: Build msfvenom Payloads in One Click",
  description:
    "Generate ready-to-run msfvenom commands with template presets for Windows, Linux, macOS, and Android payloads. Pick a payload, format, encoder, and architecture, then copy or save. Free, entirely in your browser.",
};

export default function MsfvenomGeneratorPage() {
  return (
    <ToolPageLayout
      title="MSFVenom Command Generator"
      description="Build a complete msfvenom command from template presets or full custom selections: payload, format, evasion encoder, architecture, and connection details. Then copy it straight into your terminal."
    >
      <MsfvenomGeneratorTool />
    </ToolPageLayout>
  );
}
